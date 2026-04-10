---
name: video
description: Implement video streaming and content systems including video-on-demand, live streaming, video conferencing, and content management. Use when building video platforms, streaming apps, video conferencing features, or media content systems. Triggers on requests for video upload, live streaming, video calls, media libraries, or video content management.
---

# Video & Streaming Skills

## Overview

Production-ready patterns for video and streaming systems:
- **Video-on-demand** with upload, encoding, and playback
- **Live streaming** with real-time broadcast and chat
- **Video conferencing** with rooms and participant management
- **Content management** with libraries and organization

## Available Skills

### video-vod-standard.md
Video-on-demand with:
- Video upload and processing
- Adaptive bitrate encoding
- Video player integration
- Thumbnail generation
- Playback analytics

### video-livestream-standard.md
Live streaming with:
- RTMP/HLS ingestion
- Real-time transcoding
- Live chat integration
- Stream recording
- Viewer analytics

### video-conferencing-standard.md
Video conferencing with:
- Room creation and management
- Participant permissions
- Screen sharing
- Recording and playback
- Virtual backgrounds

### video-content-standard.md
Content management with:
- Video library organization
- Categories and playlists
- Metadata and tagging
- Content scheduling
- Access control and monetization

## Implementation Workflow

1. **Choose platform** - AWS MediaConvert, Mux, or Cloudflare Stream
2. **Set up upload** - Direct upload with progress tracking
3. **Configure encoding** - Adaptive bitrate for multiple devices
4. **Build player** - Video.js or custom player integration
5. **Add features** - Comments, reactions, analytics

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Video Processing:** AWS MediaConvert, Mux
- **CDN:** CloudFront, Cloudflare
- **Player:** Video.js, HLS.js
- **Live:** AWS IVS, Mux Live
- **Conferencing:** Twilio Video, Daily.co
- **Storage:** AWS S3 for source files
