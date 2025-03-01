import React, { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

interface ShareDesignProps {
  thumbnails: string[];
  designName: string;
  onClose: () => void;
}

const ShareDesign: React.FC<ShareDesignProps> = ({
  thumbnails,
  designName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Générer une URL de partage (simulée pour le moment)
  const generateShareUrl = async () => {
    // Dans une implémentation réelle, on enverrait les données à un serveur
    // qui générerait un lien de partage. Pour l'instant, on simule cela.
    const mockShareId = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/shared/${mockShareId}`;
    setShareUrl(url);
    return url;
  };

  // Copier l'URL dans le presse-papier
  const copyToClipboard = async () => {
    const url = shareUrl || (await generateShareUrl());
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Partager sur Facebook (simulation)
  const shareOnFacebook = async () => {
    const url = shareUrl || (await generateShareUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  // Partager sur Twitter (simulation)
  const shareOnTwitter = async () => {
    const url = shareUrl || (await generateShareUrl());
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(
        `Découvrez mon design de nail art "${designName}" créé avec Nailhart!`
      )}`,
      "_blank"
    );
  };

  // Partager sur Instagram (redirection vers l'app mobile)
  const shareOnInstagram = () => {
    alert(
      "Pour partager sur Instagram, veuillez prendre une capture d'écran et la partager via l'application Instagram."
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium flex items-center">
            <Share2 className="mr-2" />
            Partager votre design
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/70 mb-4">
            Partagez votre création "{designName}" avec vos amis et sur les
            réseaux sociaux.
          </p>

          <div className="flex space-x-2 mb-4 overflow-x-auto py-2">
            {thumbnails.slice(0, 5).map((thumb, idx) => (
              <div
                key={idx}
                className="w-16 h-24 bg-white/10 rounded overflow-hidden flex-shrink-0"
              >
                <img
                  src={thumb}
                  alt={`Ongle ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl || "Générer un lien de partage..."}
              readOnly
              className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-sm"
              onClick={generateShareUrl}
            />
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
              title="Copier le lien"
            >
              {copied ? <Check className="text-green-500" /> : <Copy />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={shareOnFacebook}
              className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 flex flex-col items-center"
            >
              <Facebook />
              <span className="text-xs mt-1">Facebook</span>
            </button>
            <button
              onClick={shareOnTwitter}
              className="p-3 rounded-lg bg-sky-500 hover:bg-sky-600 flex flex-col items-center"
            >
              <Twitter />
              <span className="text-xs mt-1">Twitter</span>
            </button>
            <button
              onClick={shareOnInstagram}
              className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 flex flex-col items-center"
            >
              <Instagram />
              <span className="text-xs mt-1">Instagram</span>
            </button>
          </div>

          <div className="mt-6 text-xs text-white/50">
            En partageant votre design, vous acceptez qu'il soit visible
            publiquement.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDesign;
