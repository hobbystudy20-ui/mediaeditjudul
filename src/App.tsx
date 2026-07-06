import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  Image,
  Video,
  X,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Move,
  Trash2,
  Download,
  Loader2,
  CheckCircle,
  Type,
  Palette,
  Settings,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sun,
  Circle,
  Sliders,
  Plus,
  Minus,
  GripVertical,
} from 'lucide-react';

const FONT_OPTIONS = [
  { name: 'Poppins', family: 'font-poppins', label: 'Poppins ExtraBold' },
  { name: 'Montserrat', family: 'font-montserrat', label: 'Montserrat ExtraBold' },
  { name: 'Bebas Neue', family: 'font-bebas', label: 'Bebas Neue' },
  { name: 'Lilita One', family: 'font-lilita', label: 'Lilita One' },
  { name: 'Fredoka', family: 'font-fredoka', label: 'Fredoka Bold' },
  { name: 'League Spartan', family: 'font-league', label: 'League Spartan' },
  { name: 'Anton', family: 'font-anton', label: 'Anton' },
  { name: 'Outfit', family: 'font-outfit', label: 'Outfit SemiBold' },
  { name: 'Sora', family: 'font-sora', label: 'Sora Bold' },
  { name: 'Playfair Display', family: 'font-playfair', label: 'Playfair Display Bold' },
];

const COLOR_PRESETS = [
  { name: 'Soft Pink', color: '#FFB6C1' },
  { name: 'Lavender', color: '#E6E6FA' },
  { name: 'Baby Blue', color: '#89CFF0' },
  { name: 'Mint', color: '#98FB98' },
  { name: 'Peach', color: '#FFDAB9' },
  { name: 'Pink', color: '#FB5EA8' },
  { name: 'Hitam', color: '#000000' },
  { name: 'Putih', color: '#FFFFFF' },
  { name: 'Royal Blue', color: '#4169E1' },
  { name: 'Emerald Green', color: '#50C878' },
];

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

interface TextPosition {
  x: number;
  y: number;
}

interface LogoPosition {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  flipH: boolean;
  flipV: boolean;
}

const DEFAULT_TEXT_SETTINGS = {
  fontSize: 32,
  letterSpacing: 0,
  lineSpacing: 1.3,
  opacity: 1,
  color: '#000000',
  outline: false,
  outlineColor: '#FFFFFF',
  outlineWidth: 2,
  shadow: false,
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowOpacity: 0.5,
  alignment: 'center' as 'left' | 'center' | 'right',
};

function App() {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [pendampingan, setPendampingan] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [barisTambahan, setBarisTambahan] = useState('');

  const [selectedFont, setSelectedFont] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [customColor, setCustomColor] = useState('#000000');

  const [textSettings, setTextSettings] = useState(DEFAULT_TEXT_SETTINGS);

  const [textPosition, setTextPosition] = useState<TextPosition>({ x: 50, y: 80 });
  const [logoSettings, setLogoSettings] = useState<LogoPosition>({
    x: 10,
    y: 10,
    scale: 1,
    rotation: 0,
    opacity: 1,
    flipH: false,
    flipV: false,
  });

  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
  }, [mediaPreview]);

  useEffect(() => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
  }, [logoPreview]);

  useEffect(() => {
    setTextSettings(prev => ({ ...prev, color: selectedColor }));
  }, [selectedColor]);

  const handleMediaUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      alert('Format file tidak didukung. Gunakan JPG, JPEG, PNG, WEBP, MP4, atau MOV.');
      return;
    }

    URL.revokeObjectURL(mediaPreview || '');

    const preview = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreview(preview);
    setMediaType(isImage ? 'image' : 'video');
    setDownloadSuccess(false);

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        setMediaDimensions({ width: img.width, height: img.height });
      };
      img.src = preview;
    } else {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        setMediaDimensions({ width: video.videoWidth, height: video.videoHeight });
      };
      video.src = preview;
    }

    setTextPosition({ x: 50, y: 80 });
    setLogoSettings(prev => ({ ...prev, x: 10, y: 10 }));
  }, [mediaPreview]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/webp') {
      alert('Format logo harus PNG (disarankan transparan), JPG, atau WEBP.');
      return;
    }

    URL.revokeObjectURL(logoPreview || '');

    const preview = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(preview);
    setLogoSettings({ x: 10, y: 10, scale: 1, rotation: 0, opacity: 1, flipH: false, flipV: false });
  }, [logoPreview]);

  const removeMedia = useCallback(() => {
    URL.revokeObjectURL(mediaPreview || '');
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setMediaDimensions({ width: 0, height: 0 });
  }, [mediaPreview]);

  const removeLogo = useCallback(() => {
    URL.revokeObjectURL(logoPreview || '');
    setLogoFile(null);
    setLogoPreview(null);
  }, [logoPreview]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTextLines = () => {
    const lines = [`Pendampingan ${pendampingan}`, lokasi, formatDate(tanggal)];
    if (barisTambahan.trim()) {
      lines.push(barisTambahan.trim());
    }
    return lines;
  };

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, type: 'text' | 'logo') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'text') {
      setIsDraggingText(true);
    } else {
      setIsDraggingLogo(true);
    }
  }, []);

  const updatePosition = useCallback((clientX: number, clientY: number, type: 'text' | 'logo', rect: DOMRect) => {
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (type === 'text') {
      setTextPosition({ x: clampedX, y: clampedY });
    } else {
      setLogoSettings(prev => ({ ...prev, x: clampedX, y: clampedY }));
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    if (isDraggingText) {
      updatePosition(clientX, clientY, 'text', rect);
    } else if (isDraggingLogo) {
      updatePosition(clientX, clientY, 'logo', rect);
    }
  }, [isDraggingText, isDraggingLogo, updatePosition]);

  const handleDragEnd = useCallback(() => {
    setIsDraggingText(false);
    setIsDraggingLogo(false);
  }, []);

  const getTextStyle = useCallback(() => {
    const font = FONT_OPTIONS[selectedFont];
    const style: React.CSSProperties = {
      fontFamily: font.name,
      fontSize: `${textSettings.fontSize}px`,
      letterSpacing: `${textSettings.letterSpacing}px`,
      lineHeight: textSettings.lineSpacing,
      textAlign: textSettings.alignment,
      color: textSettings.color,
      opacity: textSettings.opacity,
      whiteSpace: 'pre-wrap',
      wordBreak: 'keep-all',
    } as React.CSSProperties;

    if (textSettings.shadow) {
      style.textShadow = `0 0 ${textSettings.shadowBlur}px rgba(${hexToRgb(textSettings.shadowColor)}, ${textSettings.shadowOpacity})`;
    }

    if (textSettings.outline) {
      style.WebkitTextStroke = `${textSettings.outlineWidth}px ${textSettings.outlineColor}`;
    }

    return style;
  }, [selectedFont, textSettings]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  const downloadImage = useCallback(async () => {
    if (!mediaFile || !mediaPreview || !canvasRef.current) return;

    setIsProcessing(true);
    setDownloadSuccess(false);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = mediaPreview;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (logoFile && logoPreview) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          logoImg.onload = () => resolve();
          logoImg.onerror = () => reject(new Error('Failed to load logo'));
          logoImg.src = logoPreview;
        });

        const logoSize = Math.min(img.width, img.height) * 0.15 * logoSettings.scale;
        const logoX = (logoSettings.x / 100) * img.width - logoSize / 2;
        const logoY = (logoSettings.y / 100) * img.height - logoSize / 2;

        ctx.save();
        ctx.globalAlpha = logoSettings.opacity;
        ctx.translate(logoX + logoSize / 2, logoY + logoSize / 2);
        ctx.rotate((logoSettings.rotation * Math.PI) / 180);
        ctx.scale(logoSettings.flipH ? -1 : 1, logoSettings.flipV ? -1 : 1);
        ctx.drawImage(logoImg, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
        ctx.restore();
      }

      const lines = getTextLines();
      if (pendampingan && lokasi) {
        const font = FONT_OPTIONS[selectedFont];
        const relativeFontSize = (textSettings.fontSize / 400) * img.width;

        const lineHeight = relativeFontSize * textSettings.lineSpacing;
        const totalHeight = lines.length * lineHeight;
        const startY = (textPosition.y / 100) * img.height - (totalHeight / 2) + lineHeight * 0.8;

        ctx.save();
        ctx.globalAlpha = textSettings.opacity;

        const alignment = textSettings.alignment;
        const xPos = (textPosition.x / 100) * img.width;

        ctx.textAlign = alignment;
        ctx.textBaseline = 'top';
        ctx.font = `bold ${relativeFontSize}px "${font.name}"`;

        if (textSettings.shadow) {
          ctx.shadowColor = textSettings.shadowColor;
          ctx.shadowBlur = textSettings.shadowBlur * (img.width / 400);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        if (textSettings.outline) {
          ctx.strokeStyle = textSettings.outlineColor;
          ctx.lineWidth = textSettings.outlineWidth * (img.width / 400);
          lines.forEach((line, index) => {
            ctx.strokeText(line, xPos, startY + index * lineHeight);
          });
        }

        ctx.fillStyle = textSettings.color;
        lines.forEach((line, index) => {
          ctx.fillText(line, xPos, startY + index * lineHeight);
        });

        ctx.restore();
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png', 1.0);
      });

      const url = URL.createObjectURL(blob);
      const fileName = `Pendampingan_${pendampingan || 'X'}_${lokasi.replace(/\s+/g, '_') || 'X'}_${tanggal}.png`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Download error:', error);
      alert('Terjadi kesalahan saat memproses gambar. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  }, [mediaFile, mediaPreview, logoFile, logoPreview, logoSettings, pendampingan, lokasi, tanggal, barisTambahan, selectedFont, textSettings, textPosition, getTextLines]);

  const downloadVideo = useCallback(async () => {
    if (!mediaFile || !mediaPreview) return;

    setIsProcessing(true);
    setDownloadSuccess(false);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = mediaPreview;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video'));
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const mediaRecorder = new MediaRecorder(canvas.captureStream(30), { mimeType: 'video/webm', videoBitsPerSecond: 8000000 });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = resolve;
      });

      const progressCanvas = document.createElement('canvas');
      progressCanvas.width = video.videoWidth;
      progressCanvas.height = video.videoHeight;
      const progressCtx = progressCanvas.getContext('2d');

      if (progressCtx) {
        progressCtx.fillStyle = '#rgba(0,0,0,0.8)';
        progressCtx.fillRect(0, 0, progressCanvas.width, progressCanvas.height);
        progressCtx.fillStyle = '#FFFFFF';
        progressCtx.font = 'bold 48px sans-serif';
        progressCtx.textAlign = 'center';
        progressCtx.fillText('Memproses video...', progressCanvas.width / 2, progressCanvas.height / 2);
      }

      const startDraw = () => {
        let startTime = performance.now();

        const drawFrame = () => {
          const elapsed = performance.now() - startTime;
          const drawCtx = canvas.getContext('2d');
          if (!drawCtx) return;

          drawCtx.drawImage(video, 0, 0);

          if (logoFile && logoPreview) {
            const logoImg = new Image();
            logoImg.src = logoPreview;
            const logoSize = Math.min(video.videoWidth, video.videoHeight) * 0.15 * logoSettings.scale;
            const logoX = (logoSettings.x / 100) * video.videoWidth - logoSize / 2;
            const logoY = (logoSettings.y / 100) * video.videoHeight - logoSize / 2;

            drawCtx.save();
            drawCtx.globalAlpha = logoSettings.opacity;
            drawCtx.translate(logoX + logoSize / 2, logoY + logoSize / 2);
            drawCtx.rotate((logoSettings.rotation * Math.PI) / 180);
            drawCtx.scale(logoSettings.flipH ? -1 : 1, logoSettings.flipV ? -1 : 1);
            drawCtx.drawImage(logoImg, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
            drawCtx.restore();
          }

          const lines = getTextLines();
          if (pendampingan && lokasi) {
            const font = FONT_OPTIONS[selectedFont];
            const relativeFontSize = (textSettings.fontSize / 400) * video.videoWidth;
            const lineHeight = relativeFontSize * textSettings.lineSpacing;
            const totalHeight = lines.length * lineHeight;
            const startY = (textPosition.y / 100) * video.videoHeight - (totalHeight / 2) + lineHeight * 0.8;
            const xPos = (textPosition.x / 100) * video.videoWidth;

            drawCtx.save();
            drawCtx.globalAlpha = textSettings.opacity;
            drawCtx.textAlign = textSettings.alignment;
            drawCtx.textBaseline = 'top';
            drawCtx.font = `bold ${relativeFontSize}px "${font.name}"`;

            if (textSettings.shadow) {
              drawCtx.shadowColor = textSettings.shadowColor;
              drawCtx.shadowBlur = textSettings.shadowBlur * (video.videoWidth / 400);
            }

            if (textSettings.outline) {
              drawCtx.strokeStyle = textSettings.outlineColor;
              drawCtx.lineWidth = textSettings.outlineWidth * (video.videoWidth / 400);
              lines.forEach((line, index) => {
                drawCtx.strokeText(line, xPos, startY + index * lineHeight);
              });
            }

            drawCtx.fillStyle = textSettings.color;
            lines.forEach((line, index) => {
              drawCtx.fillText(line, xPos, startY + index * lineHeight);
            });

            drawCtx.restore();
          }
        };

        video.play();
        mediaRecorder.start(100);

        const animationLoop = () => {
          if (!video.paused && !video.ended) {
            drawFrame();
            requestAnimationFrame(animationLoop);
          }
        };

        animationLoop();
      };

      video.onended = () => {
        mediaRecorder.stop();
      };

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          mediaRecorder.onstop = () => {
            resolve();
          };
        }, video.duration * 1000);
      });

      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const fileName = `Pendampingan_${pendampingan || 'X'}_${lokasi.replace(/\s+/g, '_') || 'X'}_${tanggal}.mp4`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Video download error:', error);
      alert('Fitur download video saat ini dalam pengembangan. Untuk hasil terbaik, gunakan screenshot atau screen recording.');
    } finally {
      setIsProcessing(false);
    }
  }, [mediaFile, mediaPreview, logoFile, logoPreview, logoSettings, pendampingan, lokasi, tanggal, barisTambahan, selectedFont, textSettings, textPosition, getTextLines]);

  const handleDownload = useCallback(async () => {
    if (!mediaType) return;

    if (mediaType === 'image') {
      await downloadImage();
    } else {
      await downloadVideo();
    }
  }, [mediaType, downloadImage, downloadVideo]);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    handleDragStart(e, 'text');
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [handleDragStart]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-40 safe-top">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-center">
            <span className="text-primary">Title</span> Generator
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-16">
        <div className="py-4 space-y-4">
          <div className="bg-white rounded-card shadow-card p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4 text-primary" />
              Langkah 1 — Upload Media
            </h2>

            {mediaPreview ? (
              <div className="relative">
                <div
                  ref={previewContainerRef}
                  className="relative w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 touch-none select-none"
                  style={{ aspectRatio: mediaDimensions.width && mediaDimensions.height ? `${mediaDimensions.width}/${mediaDimensions.height}` : '16/9' }}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleMouseMove}
                  onMouseUp={handleDragEnd}
                  onTouchEnd={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  {mediaType === 'image' ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={mediaPreview}
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                      draggable={false}
                    />
                  )}

                  <div
                    className={`absolute cursor-move select-none ${isDraggingText ? 'opacity-80' : ''}`}
                    style={{
                      left: `${textPosition.x}%`,
                      top: `${textPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => {
                      if (mediaType === 'image') handleDragStart(e, 'text');
                    }}
                    onTouchStart={(e) => {
                      if (mediaType === 'image') handleDragStart(e, 'text');
                    }}
                  >
                    <div className="flex items-center justify-center mb-1 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4 text-primary" />
                    </div>
                    <div
                      className="text-center px-2"
                      style={getTextStyle()}
                    >
                      {getTextLines().map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                  </div>

                  {logoPreview && (
                    <div
                      className={`absolute cursor-move ${isDraggingLogo ? 'opacity-80' : ''}`}
                      style={{
                        left: `${logoSettings.x}%`,
                        top: `${logoSettings.y}%`,
                        transform: `translate(-50%, -50%) rotate(${logoSettings.rotation}deg) scale(${logoSettings.flipH ? -1 : 1}, ${logoSettings.flipV ? -1 : 1}) scale(${logoSettings.scale})`,
                        opacity: logoSettings.opacity,
                      }}
                      onMouseDown={(e) => {
                        if (mediaType === 'image') handleDragStart(e, 'logo');
                      }}
                      onTouchStart={(e) => {
                        if (mediaType === 'image') handleDragStart(e, 'logo');
                      }}
                    >
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-16 h-16 object-contain pointer-events-none"
                        draggable={false}
                      />
                      <GripVertical className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-3 h-3 text-primary opacity-60" />
                    </div>
                  )}
                </div>

                <button
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg transition-transform active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>

                <p className="text-xs text-gray-500 mt-2 text-center">
                  Seret teks untuk mengatur posisi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={`${ACCEPTED_IMAGE_TYPES.join(',')},${ACCEPTED_VIDEO_TYPES.join(',')}`}
                  onChange={handleMediaUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-pink-50 transition-all duration-200 active:bg-pink-100"
                >
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <span className="text-gray-700 font-medium">Ketuk untuk Upload</span>
                  <span className="text-xs text-gray-500">JPG, PNG, WEBP, MP4, MOV</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-pink-50 hover:border-primary transition-all"
                  >
                    <Image className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Upload Foto</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-pink-50 hover:border-primary transition-all"
                  >
                    <Video className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Upload Video</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-card shadow-card p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Image className="w-4 h-4 text-primary" />
              Langkah 2 — Upload Logo (Opsional)
            </h2>

            {logoPreview ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-20 h-20 object-contain bg-gray-100 rounded-lg"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Ukuran</label>
                    <input
                      type="range"
                      min="0.2"
                      max="3"
                      step="0.1"
                      value={logoSettings.scale}
                      onChange={(e) => setLogoSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                      className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Rotasi</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLogoSettings(prev => ({ ...prev, rotation: prev.rotation - 15 }))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors active:scale-90"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="15"
                        value={logoSettings.rotation}
                        onChange={(e) => setLogoSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                        className="flex-1 accent-primary h-2 rounded-lg appearance-none cursor-pointer"
                      />
                      <button
                        onClick={() => setLogoSettings(prev => ({ ...prev, rotation: prev.rotation + 15 }))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors active:scale-90"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Opacity</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={logoSettings.opacity}
                      onChange={(e) => setLogoSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                      className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setLogoSettings(prev => ({ ...prev, flipH: !prev.flipH }))}
                      className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm transition-all ${logoSettings.flipH ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <FlipHorizontal className="w-4 h-4" /> Flip H
                    </button>
                    <button
                      onClick={() => setLogoSettings(prev => ({ ...prev, flipV: !prev.flipV }))}
                      className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm transition-all ${logoSettings.flipV ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <FlipVertical className="w-4 h-4" /> Flip V
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-pink-50 hover:border-primary transition-all"
                >
                  <Image className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">Upload Logo / Watermark</span>
                </button>

                <p className="text-xs text-gray-500 mt-2 text-center">
                  PNG transparan disarankan
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-card shadow-card p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Type className="w-4 h-4 text-primary" />
              Langkah 3 — Isi Judul
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Pendampingan Apa? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={pendampingan}
                  onChange={(e) => setPendampingan(e.target.value)}
                  placeholder="Contoh: RANAP, Rawat Jalan, MCU..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Di Mana? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Contoh: RSUD Dr. Moewardi"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Baris Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={barisTambahan}
                  onChange={(e) => setBarisTambahan(e.target.value)}
                  placeholder="Contoh: Shift Malam, Durasi 24 Jam..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card shadow-card p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Type className="w-4 h-4 text-primary" />
              Langkah 4 — Pilihan Font
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((font, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFont(index)}
                  className={`px-3 py-2.5 rounded-xl text-sm transition-all ${selectedFont === index
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-gray-50 border border-gray-200 hover:bg-pink-50 hover:border-primary'
                    }`}
                  style={{ fontFamily: font.name }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-card shadow-card p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Palette className="w-4 h-4 text-primary" />
              Langkah 5 — Warna
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Pastel</label>
                <div className="flex gap-2">
                  {COLOR_PRESETS.slice(0, 5).map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedColor(preset.color);
                        setCustomColor(preset.color);
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-transform active:scale-90 ${selectedColor === preset.color
                        ? 'border-primary border-3 ring-2 ring-primary/30 scale-110'
                        : 'border-gray-200'
                        }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">Bold</label>
                <div className="flex gap-2">
                  {COLOR_PRESETS.slice(5).map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedColor(preset.color);
                        setCustomColor(preset.color);
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-transform active:scale-90 ${selectedColor === preset.color
                        ? 'border-primary border-3 ring-2 ring-primary/30 scale-110'
                        : 'border-gray-200'
                        } ${preset.color === '#FFFFFF' ? 'bg-white border-gray-300' : ''}`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">Custom Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setSelectedColor(e.target.value);
                    }}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200 overflow-hidden"
                  />
                  <input
                    type="text"
                    value={customColor.toUpperCase()}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        setCustomColor(value);
                        setSelectedColor(value);
                      }
                    }}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 font-mono text-sm uppercase"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4 text-primary" />
                Langkah 6 — Pengaturan
              </h2>
              {showSettings ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {showSettings && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 flex items-center justify-between">
                    <span>Ukuran Font</span>
                    <span className="font-medium">{textSettings.fontSize}px</span>
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="72"
                    step="2"
                    value={textSettings.fontSize}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 flex items-center justify-between">
                    <span>Letter Spacing</span>
                    <span className="font-medium">{textSettings.letterSpacing}px</span>
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="10"
                    step="0.5"
                    value={textSettings.letterSpacing}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, letterSpacing: parseFloat(e.target.value) }))}
                    className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 flex items-center justify-between">
                    <span>Line Spacing</span>
                    <span className="font-medium">{textSettings.lineSpacing.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={textSettings.lineSpacing}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, lineSpacing: parseFloat(e.target.value) }))}
                    className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 flex items-center justify-between">
                    <span>Opacity</span>
                    <span className="font-medium">{Math.round(textSettings.opacity * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={textSettings.opacity}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                    className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Alignment</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTextSettings(prev => ({ ...prev, alignment: 'left' }))}
                      className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all ${textSettings.alignment === 'left' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTextSettings(prev => ({ ...prev, alignment: 'center' }))}
                      className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all ${textSettings.alignment === 'center' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTextSettings(prev => ({ ...prev, alignment: 'right' }))}
                      className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all ${textSettings.alignment === 'right' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs text-gray-600 flex items-center gap-2">
                      <Circle className="w-3 h-3" />
                      Outline
                    </label>
                    <button
                      onClick={() => setTextSettings(prev => ({ ...prev, outline: !prev.outline }))}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${textSettings.outline
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                      {textSettings.outline ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {textSettings.outline && (
                    <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Warna:</span>
                        <input
                          type="color"
                          value={textSettings.outlineColor}
                          onChange={(e) => setTextSettings(prev => ({ ...prev, outlineColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 overflow-hidden"
                        />
                        <input
                          type="text"
                          value={textSettings.outlineColor.toUpperCase()}
                          onChange={(e) => {
                            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                              setTextSettings(prev => ({ ...prev, outlineColor: e.target.value }));
                            }
                          }}
                          className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 font-mono text-xs uppercase"
                        />
                      </div>

                      <div>
                        <span className="text-xs text-gray-500">Ketebalan: {textSettings.outlineWidth}px</span>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          step="0.5"
                          value={textSettings.outlineWidth}
                          onChange={(e) => setTextSettings(prev => ({ ...prev, outlineWidth: parseFloat(e.target.value) }))}
                          className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs text-gray-600 flex items-center gap-2">
                      <Sun className="w-3 h-3" />
                      Shadow
                    </label>
                    <button
                      onClick={() => setTextSettings(prev => ({ ...prev, shadow: !prev.shadow }))}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${textSettings.shadow
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                      {textSettings.shadow ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {textSettings.shadow && (
                    <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Warna:</span>
                        <input
                          type="color"
                          value={textSettings.shadowColor}
                          onChange={(e) => setTextSettings(prev => ({ ...prev, shadowColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 overflow-hidden"
                        />
                        <input
                          type="text"
                          value={textSettings.shadowColor.toUpperCase()}
                          onChange={(e) => {
                            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                              setTextSettings(prev => ({ ...prev, shadowColor: e.target.value }));
                            }
                          }}
                          className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 font-mono text-xs uppercase"
                        />
                      </div>

                      <div>
                        <span className="text-xs text-gray-500">Blur: {textSettings.shadowBlur}px</span>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={textSettings.shadowBlur}
                          onChange={(e) => setTextSettings(prev => ({ ...prev, shadowBlur: parseInt(e.target.value) }))}
                          className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer mt-1"
                        />
                      </div>

                      <div>
                        <span className="text-xs text-gray-500">Opacity: {Math.round(textSettings.shadowOpacity * 100)}%</span>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={textSettings.shadowOpacity}
                          onChange={(e) => setTextSettings(prev => ({ ...prev, shadowOpacity: parseFloat(e.target.value) }))}
                          className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {mediaPreview && (
            <button
              onClick={handleDownload}
              disabled={isProcessing || !pendampingan || !lokasi}
              className={`w-full py-4 px-6 rounded-card font-semibold text-lg flex items-center justify-center gap-3 transition-all ${isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : downloadSuccess
                  ? 'bg-green-500 text-white'
                  : !pendampingan || !lokasi
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-primary text-white hover:bg-pink-600 active:scale-[0.98] shadow-lg shadow-primary/30'
                }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Berhasil! File Telah Diunduh
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Hasil
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
