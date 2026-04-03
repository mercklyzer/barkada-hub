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
      .subscribe();

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
      }).catch(() => {
        resolvingNightRef.current = false;
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
      }).catch(() => {
        advancingRoleRevealRef.current = false;
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
      );
      if (res.ok) {
        const data = await res.json();
        setRoleData(data as MyRoleResponse);
      }
    } catch {
      // non-critical
    }
  }, []);

  // ─── Load room data ────────────────────────────────────────────────────────

  const loadRoom = useCallback(
    async (code: string) => {
      const res = await fetch(`/api/werewolf/rooms/${code}`);
      if (!res.ok) throw new Error("Room not found");
      const data = await res.json();
      setRoom(data.room as WerewolfRoom);
      setPlayers(data.players as WerewolfPlayer[]);
      subscribe(code, (data.room as WerewolfRoom).id);
      if (data.room.phase === "role_reveal" || data.room.phase !== "lobby") {
        await fetchMyRole();
      }
    },
    [subscribe, fetchMyRole],
  );

  // ─── Init: restore session on mount ──────────────────────────────────────

  useEffect(() => {
    playerIdRef.current = getOrCreatePlayerId();
    const savedCode = sessionStorage.getItem("werewolf_room_code");
    if (savedCode) {
      roomCodeRef.current = savedCode;
      loadRoom(savedCode).catch(() => {
        sessionStorage.removeItem("werewolf_room_code");
      });
    }
    return () => {
      channelRef.current?.unsubscribe();
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
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Failed to create room");
        }
        const { roomCode } = await res.json();
        roomCodeRef.current = roomCode;
        sessionStorage.setItem("werewolf_room_code", roomCode);
        await loadRoom(roomCode);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
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
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Failed to join room");
        }
        roomCodeRef.current = upperCode;
        sessionStorage.setItem("werewolf_room_code", upperCode);
        await loadRoom(upperCode);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
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
        },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to start game");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
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
          },
        );
        if (!res.ok) return null;
        const data = await res.json();

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
        });
        setHasVoted(true);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(30);
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
      });
    } catch {
      // non-critical
    }
  }, []);

  const resetGame = useCallback(async () => {
    setRoleData(null);
    setNightActionSignals([]);
    setRoleConfirmSignals([]);
    setHasEyesClosed(false);
    setHasSubmittedNightAction(false);
    setHasVoted(false);
    setSeerPeekResult(null);
    try {
      await fetch(`/api/werewolf/rooms/${roomCodeRef.current}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: playerIdRef.current }),
      });
    } catch {
      // non-critical
    }
  }, []);

  const leaveRoom = useCallback(() => {
    channelRef.current?.unsubscribe();
    sessionStorage.removeItem("werewolf_room_code");
    setRoom(null);
    setPlayers([]);
    setRoleData(null);
    roomCodeRef.current = "";
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
