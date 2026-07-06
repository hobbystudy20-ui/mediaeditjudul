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
  Circle,
  Sun,
  Move,
  Plus,
  Minus,
} from 'lucide-react';

const FONT_OPTIONS = [
  { name: 'Poppins', label: 'Poppins ExtraBold' },
  { name: 'Montserrat', label: 'Montserrat ExtraBold' },
  { name: 'Bebas Neue', label: 'Bebas Neue' },
  { name: 'Lilita One', label: 'Lilita One' },
  { name: 'Fredoka', label: 'Fredoka Bold' },
  { name: 'League Spartan', label: 'League Spartan' },
  { name: 'Anton', label: 'Anton' },
  { name: 'Outfit', label: 'Outfit SemiBold' },
  { name: 'Sora', label: 'Sora Bold' },
  { name: 'Playfair Display', label: 'Playfair Display' },
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
  { name: 'Emerald', color: '#50C878' },
];

interface TextPosition {
  x: number;
  y: number;
}

interface LogoSettings {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  flipH: boolean;
  flipV: boolean;
}

interface TextSettings {
  fontSize: number;
  letterSpacing: number;
  lineSpacing: number;
  opacity: number;
  alignment: 'left' | 'center' | 'right';
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOpacity: number;
}

function App() {
  // Media state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaDimensions, setMediaDimensions] = useState({ width: 0, height: 0 });

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    x: 10, y: 10, scale: 1, rotation: 0, opacity: 1, flipH: false, flipV: false
  });

  // Form state
  const [pendampingan, setPendampingan] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [barisTambahan, setBarisTambahan] = useState('');

  // Style state
  const [selectedFont, setSelectedFont] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [customColor, setCustomColor] = useState('#000000');
  const [textSettings, setTextSettings] = useState<TextSettings>({
    fontSize: 32,
    letterSpacing: 0,
    lineSpacing: 1.3,
    opacity: 1,
    alignment: 'center',
    outline: false,
    outlineColor: '#FFFFFF',
    outlineWidth: 3,
    shadow: true,
    shadowColor: '#000000',
    shadowBlur: 4,
    shadowOpacity: 0.5,
  });
  const [textPosition, setTextPosition] = useState<TextPosition>({ x: 50, y: 75 });

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState<'text' | 'logo' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Refs
  const previewRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, []);

  // Media upload handler
  const handleMediaUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Format tidak didukung. Gunakan JPG, PNG, WEBP, MP4, atau MOV.');
      return;
    }

    if (mediaPreview) URL.revokeObjectURL(mediaPreview);

    const previewUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreview(previewUrl);
    setMediaType(isImage ? 'image' : 'video');
    setDownloadSuccess(false);

    // Get dimensions
    if (isImage) {
      const img = new Image();
      img.onload = () => setMediaDimensions({ width: img.width, height: img.height });
      img.src = previewUrl;
    } else {
      const video = document.createElement('video');
      video.onloadedmetadata = () => setMediaDimensions({ width: video.videoWidth, height: video.videoHeight });
      video.src = previewUrl;
    }

    // Reset positions
    setTextPosition({ x: 50, y: 75 });
    setLogoSettings(prev => ({ ...prev, x: 10, y: 10 }));
  }, [mediaPreview]);

  // Logo upload handler
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Format logo harus gambar (PNG disarankan).');
      return;
    }

    if (logoPreview) URL.revokeObjectURL(logoPreview);

    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
    setLogoSettings({ x: 10, y: 10, scale: 1, rotation: 0, opacity: 1, flipH: false, flipV: false });
  }, [logoPreview]);

  // Remove media
  const removeMedia = useCallback(() => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setMediaDimensions({ width: 0, height: 0 });
  }, [mediaPreview]);

  // Remove logo
  const removeLogo = useCallback(() => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
  }, [logoPreview]);

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get text lines
  const getTextLines = useCallback(() => {
    const lines = [`Pendampingan ${pendampingan}`, lokasi, formatDate(tanggal)];
    if (barisTambahan.trim()) lines.push(barisTambahan.trim());
    return lines;
  }, [pendampingan, lokasi, tanggal, barisTambahan]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, type: 'text' | 'logo') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
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

    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));

    if (isDragging === 'text') {
      setTextPosition({ x, y });
    } else {
      setLogoSettings(prev => ({ ...prev, x, y }));
    }
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Download image
  const downloadImage = useCallback(async () => {
    if (!mediaFile || !mediaPreview || !canvasRef.current) return;

    setIsProcessing(true);
    setDownloadSuccess(false);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context tidak tersedia');

      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
        img.src = mediaPreview;
      });

      // Draw image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw logo if exists
      if (logoFile && logoPreview) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          logoImg.onload = () => resolve();
          logoImg.onerror = () => reject(new Error('Gagal memuat logo'));
          logoImg.src = logoPreview;
        });

        const logoSize = Math.min(img.width, img.height) * 0.15 * logoSettings.scale;
        const logoX = (logoSettings.x / 100) * img.width;
        const logoY = (logoSettings.y / 100) * img.height;

        ctx.save();
        ctx.globalAlpha = logoSettings.opacity;
        ctx.translate(logoX, logoY);
        ctx.rotate((logoSettings.rotation * Math.PI) / 180);
        ctx.scale(logoSettings.flipH ? -1 : 1, logoSettings.flipV ? -1 : 1);
        ctx.drawImage(logoImg, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
        ctx.restore();
      }

      // Draw text
      const lines = getTextLines();
      if (pendampingan && lokasi) {
        const font = FONT_OPTIONS[selectedFont];
        const relativeFontSize = Math.max(20, (textSettings.fontSize / 300) * img.width);
        const lineHeight = relativeFontSize * textSettings.lineSpacing;
        const totalHeight = lines.length * lineHeight;
        const startY = (textPosition.y / 100) * img.height - totalHeight / 2 + lineHeight * 0.8;

        const textAlign = textSettings.alignment;
        let textX: number;
        if (textAlign === 'left') {
          textX = img.width * 0.1;
          ctx.textAlign = 'left';
        } else if (textAlign === 'right') {
          textX = img.width * 0.9;
          ctx.textAlign = 'right';
        } else {
          textX = (textPosition.x / 100) * img.width;
          ctx.textAlign = 'center';
        }

        ctx.textBaseline = 'top';
        ctx.font = `bold ${relativeFontSize}px "${font.name}", sans-serif`;

        // Draw each line
        lines.forEach((line, index) => {
          const y = startY + index * lineHeight;

          // Shadow
          if (textSettings.shadow) {
            ctx.save();
            ctx.globalAlpha = textSettings.shadowOpacity;
            ctx.shadowColor = textSettings.shadowColor;
            ctx.shadowBlur = textSettings.shadowBlur * (img.width / 300);
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = textSettings.shadowColor;
            ctx.fillText(line, textX, y);
            ctx.restore();
          }

          // Outline
          if (textSettings.outline) {
            ctx.save();
            ctx.strokeStyle = textSettings.outlineColor;
            ctx.lineWidth = textSettings.outlineWidth * (img.width / 500);
            ctx.lineJoin = 'round';
            ctx.strokeText(line, textX, y);
            ctx.restore();
          }

          // Fill text
          ctx.save();
          ctx.globalAlpha = textSettings.opacity;
          ctx.fillStyle = selectedColor;
          ctx.fillText(line, textX, y);
          ctx.restore();
        });
      }

      // Convert to blob and download
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Gagal membuat file')), 'image/png', 1.0);
      });

      const url = URL.createObjectURL(blob);
      const fileName = `Pendampingan_${pendampingan}_${lokasi.replace(/\s+/g, '_')}_${tanggal}.png`;

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
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  }, [mediaFile, mediaPreview, logoFile, logoPreview, logoSettings, pendampingan, lokasi, tanggal, getTextLines, selectedFont, textSettings, textPosition, selectedColor]);

  // Download video (screenshot approach)
  const downloadVideoFrame = useCallback(async () => {
    if (!mediaPreview || !canvasRef.current || !mediaRef.current) return;

    setIsProcessing(true);
    setDownloadSuccess(false);

    try {
      const video = mediaRef.current as HTMLVideoElement;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context tidak tersedia');

      // Pause video and capture frame
      video.pause();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Draw logo
      if (logoFile && logoPreview) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          logoImg.onload = () => resolve();
          logoImg.onerror = () => reject(new Error('Gagal memuat logo'));
          logoImg.src = logoPreview;
        });

        const logoSize = Math.min(video.videoWidth, video.videoHeight) * 0.15 * logoSettings.scale;
        const logoX = (logoSettings.x / 100) * video.videoWidth;
        const logoY = (logoSettings.y / 100) * video.videoHeight;

        ctx.save();
        ctx.globalAlpha = logoSettings.opacity;
        ctx.translate(logoX, logoY);
        ctx.rotate((logoSettings.rotation * Math.PI) / 180);
        ctx.scale(logoSettings.flipH ? -1 : 1, logoSettings.flipV ? -1 : 1);
        ctx.drawImage(logoImg, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
        ctx.restore();
      }

      // Draw text
      const lines = getTextLines();
      if (pendampingan && lokasi) {
        const font = FONT_OPTIONS[selectedFont];
        const relativeFontSize = Math.max(20, (textSettings.fontSize / 300) * video.videoWidth);
        const lineHeight = relativeFontSize * textSettings.lineSpacing;
        const totalHeight = lines.length * lineHeight;
        const startY = (textPosition.y / 100) * video.videoHeight - totalHeight / 2 + lineHeight * 0.8;

        const textAlign = textSettings.alignment;
        let textX: number;
        if (textAlign === 'left') {
          textX = video.videoWidth * 0.1;
          ctx.textAlign = 'left';
        } else if (textAlign === 'right') {
          textX = video.videoWidth * 0.9;
          ctx.textAlign = 'right';
        } else {
          textX = (textPosition.x / 100) * video.videoWidth;
          ctx.textAlign = 'center';
        }

        ctx.textBaseline = 'top';
        ctx.font = `bold ${relativeFontSize}px "${font.name}", sans-serif`;

        lines.forEach((line, index) => {
          const y = startY + index * lineHeight;

          if (textSettings.shadow) {
            ctx.save();
            ctx.globalAlpha = textSettings.shadowOpacity;
            ctx.shadowColor = textSettings.shadowColor;
            ctx.shadowBlur = textSettings.shadowBlur * (video.videoWidth / 300);
            ctx.fillStyle = textSettings.shadowColor;
            ctx.fillText(line, textX, y);
            ctx.restore();
          }

          if (textSettings.outline) {
            ctx.save();
            ctx.strokeStyle = textSettings.outlineColor;
            ctx.lineWidth = textSettings.outlineWidth * (video.videoWidth / 500);
            ctx.strokeText(line, textX, y);
            ctx.restore();
          }

          ctx.save();
          ctx.globalAlpha = textSettings.opacity;
          ctx.fillStyle = selectedColor;
          ctx.fillText(line, textX, y);
          ctx.restore();
        });
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Gagal membuat file')), 'image/png', 1.0);
      });

      const url = URL.createObjectURL(blob);
      const fileName = `Pendampingan_${pendampingan}_${lokasi.replace(/\s+/g, '_')}_${tanggal}.png`;

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
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  }, [mediaPreview, logoFile, logoPreview, logoSettings, pendampingan, lokasi, tanggal, getTextLines, selectedFont, textSettings, textPosition, selectedColor]);

  const handleDownload = useCallback(() => {
    if (mediaType === 'image') {
      downloadImage();
    } else if (mediaType === 'video') {
      downloadVideoFrame();
    }
  }, [mediaType, downloadImage, downloadVideoFrame]);

  const isFormValid = pendampingan.trim() !== '' && lokasi.trim() !== '';

  return (
    <div className="min-h-screen bg-[#E4E4FF]">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FB5EA8] to-pink-400 flex items-center justify-center">
              <Type className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-[#FB5EA8] to-pink-500 bg-clip-text text-transparent">
              Title Generator
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">

        {/* Step 1 - Media Upload */}
        <section className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FB5EA8] text-white text-xs flex items-center justify-center font-bold">1</div>
            <h2 className="font-semibold text-gray-800">Upload Media</h2>
          </div>

          <div className="p-4">
            {mediaPreview ? (
              <div className="space-y-3">
                <div
                  ref={previewRef}
                  className="relative rounded-2xl overflow-hidden bg-gray-900 touch-none select-none"
                  onMouseMove={handleDragMove}
                  onTouchMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onTouchEnd={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  {mediaType === 'image' ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full"
                      draggable={false}
                    />
                  ) : (
                    <video
                      ref={mediaRef as React.RefObject<HTMLVideoElement>}
                      src={mediaPreview}
                      className="w-full"
                      controls
                      playsInline
                      draggable={false}
                    />
                  )}

                  {/* Text Overlay */}
                  <div
                    className={`absolute cursor-grab active:cursor-grabbing ${isDragging === 'text' ? 'opacity-80' : ''}`}
                    style={{
                      left: `${textPosition.x}%`,
                      top: `${textPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => handleDragStart(e, 'text')}
                    onTouchStart={(e) => handleDragStart(e, 'text')}
                  >
                    <div
                      className="text-center whitespace-nowrap px-2"
                      style={{
                        fontFamily: `"${FONT_OPTIONS[selectedFont].name}", sans-serif`,
                        fontSize: `${textSettings.fontSize}px`,
                        color: selectedColor,
                        opacity: textSettings.opacity,
                        textShadow: textSettings.shadow
                          ? `0 0 ${textSettings.shadowBlur}px rgba(0,0,0,${textSettings.shadowOpacity})`
                          : 'none',
                        WebkitTextStroke: textSettings.outline
                          ? `${textSettings.outlineWidth}px ${textSettings.outlineColor}`
                          : 'none',
                        lineHeight: textSettings.lineSpacing,
                        letterSpacing: `${textSettings.letterSpacing}px`,
                      }}
                    >
                      {getTextLines().map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </div>

                  {/* Logo Overlay */}
                  {logoPreview && (
                    <div
                      className={`absolute cursor-grab active:cursor-grabbing ${isDragging === 'logo' ? 'opacity-80' : ''}`}
                      style={{
                        left: `${logoSettings.x}%`,
                        top: `${logoSettings.y}%`,
                        transform: `translate(-50%, -50%) rotate(${logoSettings.rotation}deg) scale(${logoSettings.flipH ? -1 : 1}, ${logoSettings.flipV ? -1 : 1}) scale(${logoSettings.scale})`,
                        opacity: logoSettings.opacity,
                      }}
                      onMouseDown={(e) => handleDragStart(e, 'logo')}
                      onTouchStart={(e) => handleDragStart(e, 'logo')}
                    >
                      <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain pointer-events-none" draggable={false} />
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={removeMedia}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                  <Move className="w-3 h-3" /> Seret untuk mengatur posisi
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#FB5EA8] hover:bg-pink-50/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-[#FB5EA8]" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-700">Ketuk untuk Upload</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP, MP4, MOV</p>
                    </div>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                    <div className="flex flex-col items-center gap-2 py-4 rounded-xl bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-[#FB5EA8] cursor-pointer transition-all">
                      <Image className="w-6 h-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Upload Foto</span>
                    </div>
                  </label>
                  <label className="block">
                    <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
                    <div className="flex flex-col items-center gap-2 py-4 rounded-xl bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-[#FB5EA8] cursor-pointer transition-all">
                      <Video className="w-6 h-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Upload Video</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Step 2 - Logo Upload */}
        <section className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FB5EA8] text-white text-xs flex items-center justify-center font-bold">2</div>
            <h2 className="font-semibold text-gray-800">Upload Logo (Opsional)</h2>
          </div>

          <div className="p-4">
            {logoPreview ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain bg-gray-100 rounded-xl" />
                    <button
                      onClick={removeLogo}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Size</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={logoSettings.scale}
                      onChange={(e) => setLogoSettings(p => ({ ...p, scale: parseFloat(e.target.value) }))}
                      className="w-full accent-[#FB5EA8] mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Opacity</label>
                    <input
                      type="range"
                      min="0.2"
                      max="1"
                      step="0.1"
                      value={logoSettings.opacity}
                      onChange={(e) => setLogoSettings(p => ({ ...p, opacity: parseFloat(e.target.value) }))}
                      className="w-full accent-[#FB5EA8] mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Rotasi</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="15"
                      value={logoSettings.rotation}
                      onChange={(e) => setLogoSettings(p => ({ ...p, rotation: parseInt(e.target.value) }))}
                      className="w-full accent-[#FB5EA8] mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Flip</label>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => setLogoSettings(p => ({ ...p, flipH: !p.flipH }))}
                        className={`flex-1 p-1.5 rounded-lg text-xs ${logoSettings.flipH ? 'bg-[#FB5EA8] text-white' : 'bg-gray-100'}`}
                      >
                        <FlipHorizontal className="w-3 h-3 mx-auto" />
                      </button>
                      <button
                        onClick={() => setLogoSettings(p => ({ ...p, flipV: !p.flipV }))}
                        className={`flex-1 p-1.5 rounded-lg text-xs ${logoSettings.flipV ? 'bg-[#FB5EA8] text-white' : 'bg-gray-100'}`}
                      >
                        <FlipVertical className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <label className="block">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="hidden" />
                <div className="flex items-center justify-center gap-3 py-4 rounded-xl bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-[#FB5EA8] cursor-pointer transition-all">
                  <Image className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Logo / Watermark</span>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">PNG transparan disarankan</p>
              </label>
            )}
          </div>
        </section>

        {/* Step 3 - Form */}
        <section className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FB5EA8] text-white text-xs flex items-center justify-center font-bold">3</div>
            <h2 className="font-semibold text-gray-800">Isi Judul</h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1.5 flex items-center gap-1">
                Pendampingan Apa? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pendampingan}
                onChange={(e) => setPendampingan(e.target.value)}
                placeholder="Contoh: RANAP, Rawat Jalan, MCU, Homecare..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FB5EA8] focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1.5 flex items-center gap-1">
                Di Mana? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Contoh: RSUD Dr. Moewardi"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FB5EA8] focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1.5 flex items-center gap-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FB5EA8] focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1.5">Baris Tambahan (Opsional)</label>
              <input
                type="text"
                value={barisTambahan}
                onChange={(e) => setBarisTambahan(e.target.value)}
                placeholder="Contoh: Shift Malam, ICU, Durasi 24 Jam..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FB5EA8] focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </section>

        {/* Step 4 - Fonts */}
        <section className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FB5EA8] text-white text-xs flex items-center justify-center font-bold">4</div>
            <h2 className="font-semibold text-gray-800">Pilihan Font</h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((font, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFont(index)}
                  className={`px-3 py-2.5 rounded-xl text-sm transition-all ${selectedFont === index
                    ? 'bg-[#FB5EA8] text-white shadow-lg shadow-pink-200'
                    : 'bg-gray-50 border border-gray-200 hover:bg-pink-50 hover:border-[#FB5EA8]'
                    }`}
                  style={{ fontFamily: `"${font.name}", sans-serif` }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Step 5 - Colors */}
        <section className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FB5EA8] text-white text-xs flex items-center justify-center font-bold">5</div>
            <h2 className="font-semibold text-gray-800">Warna</h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Pastel</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PRESETS.slice(0, 5).map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedColor(preset.color);
                      setCustomColor(preset.color);
                    }}
                    className={`w-10 h-10 rounded-full transition-all ${selectedColor === preset.color ? 'ring-2 ring-offset-2 ring-[#FB5EA8] scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Bold</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PRESETS.slice(5).map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedColor(preset.color);
                      setCustomColor(preset.color);
                    }}
                    className={`w-10 h-10 rounded-full transition-all border ${selectedColor === preset.color ? 'ring-2 ring-offset-2 ring-[#FB5EA8] scale-110' : 'hover:scale-105'} ${preset.color === '#FFFFFF' ? 'border-gray-300' : 'border-transparent'}`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Custom</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setSelectedColor(e.target.value);
                  }}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0 overflow-hidden"
                />
                <input
                  type="text"
                  value={customColor.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      setCustomColor(val);
                      setSelectedColor(val);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 font-mono text-sm uppercase"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 6 - Settings */}
        <section className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 overflow-hidden">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FB5EA8] text-white text-xs flex items-center justify-center font-bold">6</div>
              <h2 className="font-semibold text-gray-800">Pengaturan</h2>
            </div>
            {showSettings ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showSettings && (
            <div className="p-4 space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Ukuran Font</span>
                  <span className="font-medium text-[#FB5EA8]">{textSettings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="72"
                  step="2"
                  value={textSettings.fontSize}
                  onChange={(e) => setTextSettings(p => ({ ...p, fontSize: parseInt(e.target.value) }))}
                  className="w-full accent-[#FB5EA8]"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Letter Spacing</span>
                  <span className="font-medium">{textSettings.letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="10"
                  step="0.5"
                  value={textSettings.letterSpacing}
                  onChange={(e) => setTextSettings(p => ({ ...p, letterSpacing: parseFloat(e.target.value) }))}
                  className="w-full accent-[#FB5EA8]"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Line Spacing</span>
                  <span className="font-medium">{textSettings.lineSpacing.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={textSettings.lineSpacing}
                  onChange={(e) => setTextSettings(p => ({ ...p, lineSpacing: parseFloat(e.target.value) }))}
                  className="w-full accent-[#FB5EA8]"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Opacity</span>
                  <span className="font-medium">{Math.round(textSettings.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.1"
                  value={textSettings.opacity}
                  onChange={(e) => setTextSettings(p => ({ ...p, opacity: parseFloat(e.target.value) }))}
                  className="w-full accent-[#FB5EA8]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'left', Icon: AlignLeft },
                    { value: 'center', Icon: AlignCenter },
                    { value: 'right', Icon: AlignRight },
                  ].map(({ value, Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTextSettings(p => ({ ...p, alignment: value as 'left' | 'center' | 'right' }))}
                      className={`py-2.5 rounded-xl flex justify-center transition-all ${textSettings.alignment === value
                        ? 'bg-[#FB5EA8] text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Outline */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <Circle className="w-4 h-4" /> Outline
                  </label>
                  <button
                    onClick={() => setTextSettings(p => ({ ...p, outline: !p.outline }))}
                    className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${textSettings.outline
                      ? 'bg-[#FB5EA8] text-white'
                      : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {textSettings.outline ? 'ON' : 'OFF'}
                  </button>
                </div>

                {textSettings.outline && (
                  <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Warna</span>
                      <input
                        type="color"
                        value={textSettings.outlineColor}
                        onChange={(e) => setTextSettings(p => ({ ...p, outlineColor: e.target.value }))}
                        className="w-8 h-8 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textSettings.outlineColor.toUpperCase()}
                        onChange={(e) => /^#[0-9A-Fa-f]{6}$/.test(e.target.value) && setTextSettings(p => ({ ...p, outlineColor: e.target.value }))}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 font-mono text-xs"
                      />
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Ketebalan</span>
                      <span>{textSettings.outlineWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={textSettings.outlineWidth}
                      onChange={(e) => setTextSettings(p => ({ ...p, outlineWidth: parseFloat(e.target.value) }))}
                      className="w-full accent-[#FB5EA8]"
                    />
                  </div>
                )}
              </div>

              {/* Shadow */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Shadow
                  </label>
                  <button
                    onClick={() => setTextSettings(p => ({ ...p, shadow: !p.shadow }))}
                    className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${textSettings.shadow
                      ? 'bg-[#FB5EA8] text-white'
                      : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {textSettings.shadow ? 'ON' : 'OFF'}
                  </button>
                </div>

                {textSettings.shadow && (
                  <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Warna</span>
                      <input
                        type="color"
                        value={textSettings.shadowColor}
                        onChange={(e) => setTextSettings(p => ({ ...p, shadowColor: e.target.value }))}
                        className="w-8 h-8 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textSettings.shadowColor.toUpperCase()}
                        onChange={(e) => /^#[0-9A-Fa-f]{6}$/.test(e.target.value) && setTextSettings(p => ({ ...p, shadowColor: e.target.value }))}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 font-mono text-xs"
                      />
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Blur</span>
                      <span>{textSettings.shadowBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={textSettings.shadowBlur}
                      onChange={(e) => setTextSettings(p => ({ ...p, shadowBlur: parseInt(e.target.value) }))}
                      className="w-full accent-[#FB5EA8]"
                    />
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Opacity</span>
                      <span>{Math.round(textSettings.shadowOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={textSettings.shadowOpacity}
                      onChange={(e) => setTextSettings(p => ({ ...p, shadowOpacity: parseFloat(e.target.value) }))}
                      className="w-full accent-[#FB5EA8]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Download Button */}
        {mediaPreview && (
          <button
            onClick={handleDownload}
            disabled={isProcessing || !isFormValid}
            className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : downloadSuccess
                ? 'bg-green-500 text-white'
                : !isFormValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FB5EA8] text-white hover:bg-pink-600 active:scale-[0.98] shadow-xl shadow-pink-200/50'
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
                Berhasil! File Terunduh
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Hasil
              </>
            )}
          </button>
        )}

        {!isFormValid && mediaPreview && (
          <p className="text-xs text-red-500 text-center">
            Harap isi "Pendampingan Apa?" dan "Di Mana?" untuk mengaktifkan download
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
