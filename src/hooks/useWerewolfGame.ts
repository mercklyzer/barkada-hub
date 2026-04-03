"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  MyRoleResponse,
  SeerPeekResult,
  WerewolfGamePhase,
  WerewolfPlayer,
  WerewolfRoom,
} from "@/types/werewolf";

const getOrCreatePlayerId = (): string => {
  const stored = sessionStorage.getItem("werewolf_player_id");
  if (stored) return stored;
  const id = crypto.randomUUID();
  sessionStorage.setItem("werewolf_player_id", id);
  return id;
};

export const useWerewolfGame = () => {
  const [room, setRoom] = useState<WerewolfRoom | null>(null);
  const [players, setPlayers] = useState<WerewolfPlayer[]>([]);
  const [roleData, setRoleData] = useState<MyRoleResponse | null>(null);
  const [nightActionSignals, setNightActionSignals] = useState<string[]>([]);
  const [roleConfirmSignals, setRoleConfirmSignals] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Per-phase UI flags
  const [hasEyesClosed, setHasEyesClosed] = useState(false);
  const [hasSubmittedNightAction, setHasSubmittedNightAction] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [seerPeekResult, setSeerPeekResult] = useState<SeerPeekResult | null>(
    null,
  );

  const playerIdRef = useRef<string>("");
  const roomCodeRef = useRef<string>("");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const prevPhaseRef = useRef<WerewolfGamePhase | null>(null);
  const resolvingNightRef = useRef(false);
  const advancingRoleRevealRef = useRef(false);

  // Abort controller aborted on unmount — cancels all in-flight fetches at once
  const abortControllerRef = useRef<AbortController | null>(null);
  // Guards setState calls in async functions after unmount
  const isUnmountedRef = useRef(false);
  // Holds latest loadRoom reference to break circular dep with subscribe's status callback
  const loadRoomRef = useRef<((code: string) => Promise<void>) | null>(null);

  // Derived
  const myPlayer =
    players.find((p) => p.player_id === playerIdRef.current) ?? null;
  const isHost = room?.host_id === playerIdRef.current;

  // ─── Realtime subscription ───────────────────────────────────────────────

  const subscribe = useCallback((roomCode: string, roomId: string) => {
    channelRef.current?.unsubscribe();

    const channel = supabase
      .channel(`werewolf:room:${roomCode}`, {
        config: { broadcast: { self: true } },
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "werewolf_rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          setRoom(payload.new as WerewolfRoom);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "werewolf_players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPlayers((prev) => {
              const exists = prev.some(
                (p) => p.id === (payload.new as WerewolfPlayer).id,
              );
              return exists ? prev : [...prev, payload.new as WerewolfPlayer];
            });
          } else if (payload.eventType === "UPDATE") {
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === (payload.new as WerewolfPlayer).id
                  ? { ...p, ...(payload.new as WerewolfPlayer) }
                  : p,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setPlayers((prev) =>
              prev.filter((p) => p.id !== (payload.old as WerewolfPlayer).id),
            );
          }
        },
      )
      .on("broadcast", { event: "night_action_submitted" }, (payload) => {
        setNightActionSignals((prev) => {
          const actorId = payload.payload?.actorId as string;
          if (!actorId || prev.includes(actorId)) return prev;
          return [...prev, actorId];
        });
      })
      .on("broadcast", { event: "role_confirmed" }, (payload) => {
        setRoleConfirmSignals((prev) => {
          const pid = payload.payload?.playerId as string;
          if (!pid || prev.includes(pid)) return prev;
          return [...prev, pid];
        });
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setIsConnected(false);
          // Only reconnect on unexpected closure — leaveRoom nulls both refs
          // before unsubscribing, so this guard prevents spurious reconnects
          if (!isUnmountedRef.current && channelRef.current && roomCodeRef.current) {
            loadRoomRef.current?.(roomCodeRef.current).catch(() => {});
          }
        }
      });

    channelRef.current = channel;
  }, []);

  // ─── Phase transition effects ─────────────────────────────────────────────

  useEffect(() => {
    if (!room) return;
    const phase = room.phase;
    const prevPhase = prevPhaseRef.current;
    if (phase === prevPhase) return;
    prevPhaseRef.current = phase;

    if (phase === "role_reveal") {
      fetchMyRole();
      setRoleConfirmSignals([]);
      advancingRoleRevealRef.current = false;
    }
    if (phase === "night") {
      setHasEyesClosed(false);
      setHasSubmittedNightAction(false);
      setSeerPeekResult(null);
      setNightActionSignals([]);
      resolvingNightRef.current = false;
    }
    if (phase === "day_vote") {
      setHasVoted(false);
    }
    // fetchMyRole is stable (defined with useCallback below and referenced via closure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.phase]);

  // ─── Host auto-resolve night ──────────────────────────────────────────────

  useEffect(() => {
    if (!isHost || room?.phase !== "night" || resolvingNightRef.current) return;

    const alivePlayers = players.filter((p) => p.is_alive);
    const aliveWolves = alivePlayers.filter((p) => p.role === "werewolf");
    const seerAlive = alivePlayers.some((p) => p.role === "seer");
    const doctorAlive = alivePlayers.some((p) => p.role === "doctor");
    const expected =
      aliveWolves.length + (seerAlive ? 1 : 0) + (doctorAlive ? 1 : 0);

    if (expected > 0 && nightActionSignals.length >= expected) {
      resolvingNightRef.current = true;
      fetch(`/api/werewolf/rooms/${roomCodeRef.current}/resolve-night`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: playerIdRef.current }),
        signal: abortControllerRef.current?.signal,
      }).catch((e: Error) => {
        if (e.name !== "AbortError") resolvingNightRef.current = false;
      });
    }
  }, [nightActionSignals, isHost, room?.phase, players]);

  // ─── Host auto-advance role reveal ───────────────────────────────────────

  useEffect(() => {
    if (
      !isHost ||
      room?.phase !== "role_reveal" ||
      advancingRoleRevealRef.current
    )
      return;
    if (players.length > 0 && roleConfirmSignals.length >= players.length) {
      advancingRoleRevealRef.current = true;
      fetch(`/api/werewolf/rooms/${roomCodeRef.current}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: playerIdRef.current }),
        signal: abortControllerRef.current?.signal,
      }).catch((e: Error) => {
        if (e.name !== "AbortError") advancingRoleRevealRef.current = false;
      });
    }
  }, [roleConfirmSignals, isHost, room?.phase, players.length]);

  // ─── Fetch role ──────────────────────────────────────────────────────────

  const fetchMyRole = useCallback(async () => {
    const code = roomCodeRef.current;
    const pid = playerIdRef.current;
    if (!code || !pid) return;
    try {
      const res = await fetch(
        `/api/werewolf/rooms/${code}/my-role?playerId=${pid}`,
        { signal: abortControllerRef.current?.signal },
      );
      if (res.ok) {
        const data = await res.json();
        if (!isUnmountedRef.current) {
          setRoleData(data as MyRoleResponse);
        }
      }
    } catch {
      // non-critical
    }
  }, []);

  // ─── Load room data ────────────────────────────────────────────────────────

  const loadRoom = useCallback(
    async (code: string) => {
      const res = await fetch(`/api/werewolf/rooms/${code}`, {
        signal: abortControllerRef.current?.signal,
      });
      if (!res.ok) throw new Error("Room not found");
      if (isUnmountedRef.current) return;
      const data = await res.json();
      if (isUnmountedRef.current) return;
      setRoom(data.room as WerewolfRoom);
      setPlayers(data.players as WerewolfPlayer[]);
      subscribe(code, (data.room as WerewolfRoom).id);
      if (data.room.phase === "role_reveal" || data.room.phase !== "lobby") {
        await fetchMyRole();
      }
    },
    [subscribe, fetchMyRole],
  );

  // Keep loadRoomRef current so the subscribe status callback can call it
  // without creating a circular useCallback dependency
  useEffect(() => {
    loadRoomRef.current = loadRoom;
  }, [loadRoom]);

  // ─── Init: restore session on mount ──────────────────────────────────────

  useEffect(() => {
    // Reset unmount flag (React Strict Mode fires this effect twice in dev)
    isUnmountedRef.current = false;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    playerIdRef.current = getOrCreatePlayerId();
    const savedCode = sessionStorage.getItem("werewolf_room_code");

    if (savedCode) {
      roomCodeRef.current = savedCode;
      loadRoom(savedCode).catch((e: Error) => {
        if (e.name !== "AbortError" && !isUnmountedRef.current) {
          // One retry after 1.5s to recover from brief network blips on page load
          setTimeout(() => {
            if (!isUnmountedRef.current && roomCodeRef.current) {
              loadRoom(savedCode).catch(() => {
                if (!isUnmountedRef.current) {
                  sessionStorage.removeItem("werewolf_room_code");
                  roomCodeRef.current = "";
                }
              });
            }
          }, 1500);
        }
      });
    }

    const handleUnload = () => {
      // Best-effort: initiate WebSocket leave frame before browser closes
      channelRef.current?.unsubscribe();
    };

    const handleVisibilityChange = () => {
      // Re-sync state when user returns to tab — catches missed Realtime events
      if (
        document.visibilityState === "visible" &&
        roomCodeRef.current &&
        !isUnmountedRef.current
      ) {
        loadRoom(roomCodeRef.current).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload); // iOS Safari coverage
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isUnmountedRef.current = true;
      controller.abort();
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // loadRoom is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const createRoom = useCallback(
    async (playerName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/werewolf/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerName,
            playerId: playerIdRef.current,
          }),
          signal: abortControllerRef.current?.signal,
        });
        if (isUnmountedRef.current) return;
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Failed to create room");
        }
        const { roomCode } = await res.json();
        if (isUnmountedRef.current) return;
        roomCodeRef.current = roomCode;
        sessionStorage.setItem("werewolf_room_code", roomCode);
        await loadRoom(roomCode);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        if (!isUnmountedRef.current) setError((e as Error).message);
      } finally {
        if (!isUnmountedRef.current) setIsLoading(false);
      }
    },
    [loadRoom],
  );

  const joinRoom = useCallback(
    async (code: string, playerName: string) => {
      setIsLoading(true);
      setError(null);
      const upperCode = code.toUpperCase();
      try {
        const res = await fetch(`/api/werewolf/rooms/${upperCode}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerName,
            playerId: playerIdRef.current,
          }),
          signal: abortControllerRef.current?.signal,
        });
        if (isUnmountedRef.current) return;
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Failed to join room");
        }
        roomCodeRef.current = upperCode;
        sessionStorage.setItem("werewolf_room_code", upperCode);
        await loadRoom(upperCode);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        if (!isUnmountedRef.current) setError((e as Error).message);
      } finally {
        if (!isUnmountedRef.current) setIsLoading(false);
      }
    },
    [loadRoom],
  );

  const startGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/werewolf/rooms/${roomCodeRef.current}/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId: playerIdRef.current }),
          signal: abortControllerRef.current?.signal,
        },
      );
      if (isUnmountedRef.current) return;
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to start game");
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      if (!isUnmountedRef.current) setError((e as Error).message);
    } finally {
      if (!isUnmountedRef.current) setIsLoading(false);
    }
  }, []);

  const confirmRole = useCallback(() => {
    channelRef.current?.send({
      type: "broadcast",
      event: "role_confirmed",
      payload: { playerId: playerIdRef.current },
    });
  }, []);

  const closeEyes = useCallback(() => {
    setHasEyesClosed(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const submitNightAction = useCallback(
    async (targetPlayerId: string): Promise<SeerPeekResult | null> => {
      if (!roleData?.role) return null;

      const actionTypeMap: Record<
        string,
        "wolf_kill" | "seer_peek" | "doctor_protect"
      > = {
        werewolf: "wolf_kill",
        seer: "seer_peek",
        doctor: "doctor_protect",
      };
      const actionType = actionTypeMap[roleData.role];
      if (!actionType) return null;

      try {
        const res = await fetch(
          `/api/werewolf/rooms/${roomCodeRef.current}/night-action`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playerId: playerIdRef.current,
              actionType,
              targetId: targetPlayerId,
            }),
            signal: abortControllerRef.current?.signal,
          },
        );
        if (!res.ok || isUnmountedRef.current) return null;
        const data = await res.json();

        if (isUnmountedRef.current) return null;

        // Broadcast signal to host for auto-resolve tracking
        channelRef.current?.send({
          type: "broadcast",
          event: "night_action_submitted",
          payload: { actorId: playerIdRef.current },
        });

        setHasSubmittedNightAction(true);

        if (data.peekResult) {
          setSeerPeekResult(data.peekResult as SeerPeekResult);
          return data.peekResult as SeerPeekResult;
        }
        return null;
      } catch {
        return null;
      }
    },
    [roleData],
  );

  const submitDayVote = useCallback(
    async (targetPlayerId: string) => {
      if (hasVoted) return;
      try {
        await fetch(`/api/werewolf/rooms/${roomCodeRef.current}/day-vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: playerIdRef.current,
            targetId: targetPlayerId,
          }),
          signal: abortControllerRef.current?.signal,
        });
        if (!isUnmountedRef.current) {
          setHasVoted(true);
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(30);
          }
        }
      } catch {
        // non-critical
      }
    },
    [hasVoted],
  );

  const advancePhase = useCallback(async () => {
    try {
      await fetch(`/api/werewolf/rooms/${roomCodeRef.current}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: playerIdRef.current }),
        signal: abortControllerRef.current?.signal,
      });
    } catch {
      // non-critical
    }
  }, []);

  const resetGame = useCallback(async () => {
    if (!isUnmountedRef.current) {
      setRoleData(null);
      setNightActionSignals([]);
      setRoleConfirmSignals([]);
      setHasEyesClosed(false);
      setHasSubmittedNightAction(false);
      setHasVoted(false);
      setSeerPeekResult(null);
    }
    try {
      await fetch(`/api/werewolf/rooms/${roomCodeRef.current}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: playerIdRef.current }),
        signal: abortControllerRef.current?.signal,
      });
    } catch {
      // non-critical
    }
  }, []);

  const leaveRoom = useCallback(() => {
    // Null refs before unsubscribing so the channel status callback's
    // reconnect guard fires correctly when CLOSED is emitted
    const ch = channelRef.current;
    channelRef.current = null;
    roomCodeRef.current = "";
    ch?.unsubscribe();
    sessionStorage.removeItem("werewolf_room_code");
    setRoom(null);
    setPlayers([]);
    setRoleData(null);
    prevPhaseRef.current = null;
  }, []);

  return {
    room,
    players,
    myPlayer,
    roleData,
    isHost,
    nightActionSignals,
    isLoading,
    error,
    isConnected,
    hasEyesClosed,
    hasSubmittedNightAction,
    hasVoted,
    seerPeekResult,
    roomCode: roomCodeRef.current,
    playerId: playerIdRef.current,
    createRoom,
    joinRoom,
    startGame,
    confirmRole,
    closeEyes,
    submitNightAction,
    submitDayVote,
    advancePhase,
    resetGame,
    leaveRoom,
  };
};
