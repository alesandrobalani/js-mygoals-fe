interface CreateAccountQuickModalViewProps {
  name: string;
  description: string;
  submitting: boolean;
  error: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:bg-slate-100';

export function CreateAccountQuickModalView({
  name,
  description,
  submitting,
  error,
  onNameChange,
  onDescriptionChange,
  onSubmit,
  onClose,
}: CreateAccountQuickModalViewProps) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Nova Conta</h3>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="acc-name" className="block text-sm font-medium text-slate-700 mb-1">
              Nome *
            </label>
            <input
              id="acc-name"
              type="text"
              className={inputClass}
              placeholder="Nome da conta"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="acc-description" className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <input
              id="acc-description"
              type="text"
              className={inputClass}
              placeholder="Descrição opcional"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!name.trim() || submitting}
            className="px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
