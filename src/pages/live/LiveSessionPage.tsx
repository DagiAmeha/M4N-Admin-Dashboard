import { useEffect, useMemo, useState } from "react";
import { Radio, Play, Square, Youtube } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";

type LiveStatus = "unknown" | "live" | "stopped";

interface ApiMessageResponse {
  success?: boolean;
  message?: string;
}

interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface LiveStatusResponse {
  isLive?: boolean;
  youtubeVideoId?: string;
  data?: {
    isLive?: boolean;
    youtubeVideoId?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractLiveStatus(payload: unknown): {
  isLive?: boolean;
  youtubeVideoId?: string;
} {
  if (!isRecord(payload)) return {};

  const directIsLive = payload.isLive;
  const directYoutubeVideoId = payload.youtubeVideoId;
  if (typeof directIsLive === "boolean") {
    return {
      isLive: directIsLive,
      youtubeVideoId:
        typeof directYoutubeVideoId === "string"
          ? directYoutubeVideoId
          : undefined,
    };
  }

  const nestedData = payload.data;
  if (isRecord(nestedData) && typeof nestedData.isLive === "boolean") {
    return {
      isLive: nestedData.isLive,
      youtubeVideoId:
        typeof nestedData.youtubeVideoId === "string"
          ? nestedData.youtubeVideoId
          : undefined,
    };
  }

  return {};
}

function getErrorMessage(error: unknown, fallback: string): string {
  const message = (error as ApiErrorShape)?.response?.data?.message;
  if (message && message.trim().length > 0) return message;
  return fallback;
}

function normalizeYoutubeVideoId(value: string): string {
  const input = value.trim();
  if (!input) return "";

  const shortMatch = input.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch?.[1]) return shortMatch[1];

  const queryMatch = input.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (queryMatch?.[1]) return queryMatch[1];

  const embedMatch = input.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embedMatch?.[1]) return embedMatch[1];

  return input;
}

export default function LiveSessionPage() {
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [status, setStatus] = useState<LiveStatus>("unknown");
  const [syncingStatus, setSyncingStatus] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [lastStartedVideoId, setLastStartedVideoId] = useState<string | null>(
    null,
  );

  const durationMilliseconds = useMemo(() => {
    const minutes = Number(durationMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return null;
    return Math.round(minutes * 60 * 1000);
  }, [durationMinutes]);

  const statusMeta = {
    unknown: {
      label: "Not Synced",
      className: "bg-gray-100 text-gray-700 border-gray-200",
      helper: "Unable to determine live status from the server.",
    },
    live: {
      label: "Live",
      className: "bg-green-100 text-green-700 border-green-200",
      helper: "The API reports that a live session is currently running.",
    },
    stopped: {
      label: "Stopped",
      className: "bg-red-100 text-red-700 border-red-200",
      helper: "The API reports that the live session is currently stopped.",
    },
  } as const;

  async function syncLiveStatus() {
    setSyncingStatus(true);
    try {
      const res = await api.get<LiveStatusResponse>("/api/live");
      const { isLive, youtubeVideoId: currentYoutubeVideoId } =
        extractLiveStatus(res.data);

      if (typeof isLive === "boolean") {
        setStatus(isLive ? "live" : "stopped");
      } else {
        setStatus("unknown");
      }

      if (
        typeof currentYoutubeVideoId === "string" &&
        currentYoutubeVideoId.trim().length > 0
      ) {
        setLastStartedVideoId(currentYoutubeVideoId);
      }
    } catch {
      setStatus("unknown");
    } finally {
      setSyncingStatus(false);
    }
  }

  useEffect(() => {
    void syncLiveStatus();
  }, []);

  async function handleStartLive() {
    const normalizedVideoId = normalizeYoutubeVideoId(youtubeVideoId);

    if (!normalizedVideoId) {
      toast.error("Please enter a valid YouTube video ID.");
      return;
    }

    if (durationMilliseconds === null) {
      toast.error("Please enter a valid duration in minutes.");
      return;
    }

    setStarting(true);
    try {
      const payload = {
        youtubeVideoId: normalizedVideoId,
        durationMinutes: String(durationMilliseconds),
      };

      const res = await api.post<ApiMessageResponse>(
        "/api/live/start",
        payload,
      );
      setStatus("live");

      setLastStartedVideoId(normalizedVideoId);

      toast.success(
        res.data?.message ??
          "Live session started successfully. People can now join the stream.",
      );
      await syncLiveStatus();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          "Could not start the live session. Please review your inputs and try again.",
        ),
      );
    } finally {
      setStarting(false);
      setYoutubeVideoId("");
      setDurationMinutes("");
    }
  }

  async function handleStopLive() {
    setStopping(true);
    try {
      const res = await api.post<ApiMessageResponse>("/api/live/stop");
      setStatus("stopped");

      toast.success(
        res.data?.message ??
          "Live session stopped successfully. Your audience can no longer watch live.",
      );
      await syncLiveStatus();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          "Could not stop the live session right now. Please try again.",
        ),
      );
    } finally {
      setStopping(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Live Session"
        subtitle="Start or stop your church live broadcast"
        icon={Radio}
        color="bg-rose-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900">
            Start Live Session
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter a YouTube video ID and duration in minutes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <Input
              label="YouTube Video ID *"
              value={youtubeVideoId}
              onChange={(e) => setYoutubeVideoId(e.target.value)}
              placeholder="HxIHvFpEXCQ"
            />
            <Input
              label="Duration (minutes) *"
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="200"
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button onClick={handleStartLive} disabled={starting || stopping}>
              <Play size={16} />
              {starting ? "Starting..." : "Start Live"}
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Session Status
          </h3>

          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${statusMeta[status].className}`}
          >
            <span className="w-2 h-2 rounded-full bg-current opacity-75" />
            {syncingStatus ? "Checking..." : statusMeta[status].label}
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {syncingStatus
              ? "Syncing current live status from the API."
              : statusMeta[status].helper}
          </p>

          <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 space-y-3">
            <div className="flex items-start gap-2">
              <Youtube size={16} className="text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Last Started Video</p>
                <p className="break-all">
                  {lastStartedVideoId ??
                    "No live session has been started yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-base font-bold text-gray-900">Stop Live Session</h2>
        <p className="text-sm text-gray-500 mt-1">
          Stop the current live session when your program is complete.
        </p>

        <div className="mt-4">
          <Button
            variant="danger"
            onClick={handleStopLive}
            disabled={starting || stopping}
          >
            <Square size={16} />
            {stopping ? "Stopping..." : "Stop Live"}
          </Button>
        </div>
      </div>
    </div>
  );
}
