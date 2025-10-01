"use client";
import React from "react";

// Simple WhatsApp-like single message preview
export default function WhatsAppPreview({
  senderName = "Vous",
  message = "",
  mediaUrls = [],
  time = new Date(),
}) {
  const formattedTime = new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const hasMedia = Array.isArray(mediaUrls) && mediaUrls.length > 0;

  return (
    <div className="w-full h-full min-h-[280px] bg-[#efeae2] rounded-xl border shadow-inner overflow-hidden flex flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[#075E54] text-white">
        <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
          {senderName?.[0] || "V"}
        </div>
        <div className="text-sm font-medium">{senderName}</div>
        <div className="ml-auto text-xs text-white/80">Prévisualisation</div>
      </div>

      {/* Chat area */}
      <div className="flex-1 p-3 bg-[#e7dcc8]">
        <div className="max-w-[80%] ml-auto">
          <div className="relative rounded-lg bg-[#dcf8c6] shadow px-3 py-2 text-sm text-gray-900">
            {hasMedia && (
              <div className="space-y-2 mb-2">
                {mediaUrls.map((u, i) => (
                  <div key={u + i} className="overflow-hidden rounded-lg border">
                    {u.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={u} className="w-full h-40 object-cover" controls />
                    ) : (
                      <img src={u} alt="media" className="w-full h-40 object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="whitespace-pre-wrap break-words">{message || "Votre message WhatsApp apparaîtra ici."}</div>
            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-500">
              <span>{formattedTime}</span>
              {/* double check marks */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4fc3f7" className="w-3 h-3">
                <path d="M0 12l2-2 5 5L22 0l2 2L7 19z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chat input mock */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#f0f0f0] border-t">
        <div className="flex-1 text-xs text-gray-500">Zone de saisie (aperçu)</div>
        <div className="text-xs text-gray-400">{formattedTime}</div>
      </div>
    </div>
  );
}
