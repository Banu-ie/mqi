import { useEffect, useState } from "react";
import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
  type EventInput,
} from "../../api/events";
import type { Event } from "../../api/types";
import { ApiError } from "../../api/client";

type FormErrors = {
  title?: string;
  date?: string;
  location?: string;
  shortDesc?: string;
  status?: string;
  image?: string;
};

const initialForm = {
  title: "",
  date: "",
  location: "",
  shortDesc: "",
  fullDesc: "",
  image: "",
  status: "upcoming" as "upcoming" | "past",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("az-AZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(dateStr: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export default function AdminEvents() {
  const [list, setList] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState(initialForm);

  const [errors, setErrors] = useState<FormErrors>({});

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const events = await listEvents();
      setList(events);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Tədbirlər yüklənə bilmədi."
      );
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Tədbirin adı tələb olunur.";
    } else if (form.title.trim().length < 2) {
      newErrors.title =
        "Tədbirin adı ən azı 2 simvoldan ibarət olmalıdır.";
    }

    if (!form.date) {
      newErrors.date = "Tarix tələb olunur.";
    } else if (!isValidDate(form.date)) {
      newErrors.date = "Düzgün tarix seçin.";
    }

    if (!form.location.trim()) {
      newErrors.location = "Məkan tələb olunur.";
    } else if (form.location.trim().length < 2) {
      newErrors.location =
        "Məkan ən azı 2 simvoldan ibarət olmalıdır.";
    }

    if (!form.shortDesc.trim()) {
      newErrors.shortDesc = "Qısa təsvir tələb olunur.";
    } else if (form.shortDesc.trim().length < 2) {
      newErrors.shortDesc =
        "Qısa təsvir ən azı 2 simvoldan ibarət olmalıdır.";
    }

    if (form.status !== "upcoming" && form.status !== "past") {
      newErrors.status = "Düzgün status seçin.";
    }

    if (form.image.trim()) {
      try {
        new URL(form.image.trim());
      } catch {
        newErrors.image = "Şəkil URL-i düzgün formatda deyil.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const updateField = (
    field: keyof typeof initialForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field in errors) {
      clearFieldError(field as keyof FormErrors);
    }

    if (error) {
      setError(null);
    }
  };

  const openAdd = () => {
    setForm(initialForm);
    setEditId(null);
    setErrors({});
    setError(null);
    setShowForm(true);
  };

  const openEdit = (e: Event) => {
    setForm({
      title: e.title,
      date: e.date,
      location: e.location,
      shortDesc: e.shortDesc,
      fullDesc: e.fullDesc,
      image: e.image,
      status: e.status,
    });

    setEditId(e.id);
    setErrors({});
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setErrors({});
    setError(null);
  };

  const handleSave = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    const input: EventInput = {
      title: form.title.trim(),
      date: form.date,
      location: form.location.trim(),
      shortDesc: form.shortDesc.trim(),
      fullDesc: form.fullDesc.trim(),
      image: form.image.trim(),
      status: form.status,
    };

    setSaving(true);

    try {
      if (editId) {
        await updateEvent(editId, input);
        showToast("Tədbir uğurla yeniləndi.");
      } else {
        await createEvent(input);
        showToast("Tədbir uğurla əlavə edildi.");
      }

      await loadEvents();

      setShowForm(false);
      setEditId(null);
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Tədbir yadda saxlanılmadı."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleting) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteEvent(id);

      setList((prev) => prev.filter((e) => e.id !== id));
      setDeleteId(null);

      showToast("Tədbir uğurla silindi.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Tədbir silinmədi."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A2540] text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-['DM_Serif_Display'] text-xl text-[#1A2540] mb-3">
              Silmək istədiyinizə əminsiniz?
            </h3>

            <p className="text-sm text-[#6B7A99] mb-6">
              Bu əməliyyat geri qaytarıla bilməz.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-[#E4E9F4] text-[#6B7A99] font-medium disabled:opacity-50"
              >
                Ləğv et
              </button>

              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium disabled:opacity-50"
              >
                {deleting ? "Silinir..." : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl my-8">
            <h3 className="font-['DM_Serif_Display'] text-2xl text-[#1A2540] mb-6">
              {editId
                ? "Tədbiri redaktə et"
                : "Yeni tədbir əlavə et"}
            </h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">
                  Tədbirin adı *
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    updateField("title", e.target.value)
                  }
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.title
                      ? "border-red-400"
                      : "border-[#E4E9F4]"
                  } focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30`}
                />

                {errors.title && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Date + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2540] mb-2">
                    Tarix *
                  </label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      updateField("date", e.target.value)
                    }
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.date
                        ? "border-red-400"
                        : "border-[#E4E9F4]"
                    } focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30`}
                  />

                  {errors.date && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A2540] mb-2">
                    Status *
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value
                      )
                    }
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.status
                        ? "border-red-400"
                        : "border-[#E4E9F4]"
                    } focus:outline-none bg-white`}
                  >
                    <option value="upcoming">
                      Qarşıdan gələn
                    </option>

                    <option value="past">
                      Keçirilmiş
                    </option>
                  </select>

                  {errors.status && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.status}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">
                  Yer *
                </label>

                <input
                  value={form.location}
                  onChange={(e) =>
                    updateField(
                      "location",
                      e.target.value
                    )
                  }
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.location
                      ? "border-red-400"
                      : "border-[#E4E9F4]"
                  } focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30`}
                />

                {errors.location && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Short description */}
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">
                  Qısa təsvir *
                </label>

                <input
                  value={form.shortDesc}
                  onChange={(e) =>
                    updateField(
                      "shortDesc",
                      e.target.value
                    )
                  }
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.shortDesc
                      ? "border-red-400"
                      : "border-[#E4E9F4]"
                  } focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30`}
                />

                {errors.shortDesc && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.shortDesc}
                  </p>
                )}
              </div>

              {/* Full description */}
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">
                  Tam təsvir
                </label>

                <textarea
                  value={form.fullDesc}
                  onChange={(e) =>
                    updateField(
                      "fullDesc",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">
                  Şəkil URL
                </label>

                <input
                  type="url"
                  value={form.image}
                  onChange={(e) =>
                    updateField(
                      "image",
                      e.target.value
                    )
                  }
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.image
                      ? "border-red-400"
                      : "border-[#E4E9F4]"
                  } focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30`}
                />

                {errors.image && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.image}
                  </p>
                )}
              </div>
            </div>

            {/* Form buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeForm}
                disabled={saving}
                className="flex-1 py-3 rounded-xl border border-[#E4E9F4] text-[#6B7A99] font-medium disabled:opacity-50"
              >
                Ləğv et
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#e0844c] to-[#c94cb0] text-white font-semibold disabled:opacity-50"
              >
                {saving
                  ? "Yadda saxlanılır..."
                  : "Yadda saxla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540]">
            Tədbirlər
          </h1>

          <p className="text-[#6B7A99] text-sm mt-1">
            {list.length} tədbir
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e0844c] to-[#c94cb0] text-white font-semibold text-sm shadow-md hover:opacity-90"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>

          Tədbir əlavə et
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4E9F4] p-10 text-center">
          <p className="text-[#6B7A99] text-sm">
            Tədbirlər yüklənir...
          </p>
        </div>
      ) : list.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-[#E4E9F4] p-10 text-center">
          <p className="text-[#6B7A99] text-sm">
            Hələ tədbir yoxdur. "Tədbir əlavə et"
            düyməsi ilə ilkini əlavə edin.
          </p>
        </div>
      ) : (
        /* Events table */
        <div className="bg-white rounded-2xl border border-[#E4E9F4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E4E9F4] bg-[#F8FAFF]">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">
                    Tədbir
                  </th>

                  <th className="text-left px-4 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">
                    Tarix
                  </th>

                  <th className="text-left px-4 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">
                    Yer
                  </th>

                  <th className="text-left px-4 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">
                    Əməliyyat
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E4E9F4]">
                {list.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-[#F8FAFF] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0F4FE]">
                          {e.image && (
                            <img
                              src={e.image}
                              alt={e.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="text-sm font-medium text-[#1A2540]">
                          {e.title}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-[#6B7A99]">
                      {formatDate(e.date)}
                    </td>

                    <td className="px-4 py-4 text-sm text-[#6B7A99] max-w-xs truncate">
                      {e.location}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          e.status === "upcoming"
                            ? "bg-green-100 text-[#49a455]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {e.status === "upcoming"
                          ? "Qarşıdan gələn"
                          : "Keçirilmiş"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(e)}
                          className="px-3 py-1.5 rounded-lg bg-[#EEF3FD] text-[#3B6FE0] text-xs font-medium hover:bg-[#3B6FE0] hover:text-white transition-colors"
                        >
                          Redaktə
                        </button>

                        <button
                          onClick={() => setDeleteId(e.id)}
                          disabled={deleting}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}