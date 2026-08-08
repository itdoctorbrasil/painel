import React from 'react';
import { User } from '../../types';
import { Eye, ShieldAlert, ArrowLeft, Key } from 'lucide-react';

interface ImpersonationBannerProps {
  currentUser: User;
  activeResellerView?: User | null;
  onExitImpersonation: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({
  currentUser,
  activeResellerView,
  onExitImpersonation
}) => {
  if (currentUser.role !== 'master' || !activeResellerView) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 flex flex-wrap items-center justify-between shadow-lg text-xs sm:text-sm font-medium z-40 border-b border-amber-400/30">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-black/20 text-amber-200">
          <Eye className="w-4 h-4" />
        </div>
        <span>
          <strong>Modo de Visualização do Master:</strong> Você está editando e gerenciando o layout do revendedor <strong className="text-amber-100 font-bold uppercase tracking-wide">{activeResellerView.name}</strong> ({activeResellerView.email})
        </span>
      </div>

      <div className="flex items-center gap-3 mt-1 sm:mt-0">
        <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-amber-200 text-xs flex items-center gap-1">
          <Key className="w-3 h-3" /> Token: {activeResellerView.resellerToken}
        </span>
        <button
          onClick={onExitImpersonation}
          className="bg-slate-900 hover:bg-black text-amber-300 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Master Admin
        </button>
      </div>
    </div>
  );
};
