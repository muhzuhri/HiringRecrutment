"use client";

import React, { useState } from "react";
import {
  StaffAccount,
  createStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
} from "@/app/actions/admin";
import {
  Users,
  Plus,
  Search,
  Shield,
  Award,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Mail,
  Lock,
  UserCheck,
} from "lucide-react";

interface StaffUserManagerProps {
  initialStaff: StaffAccount[];
}

export default function StaffUserManager({ initialStaff }: StaffUserManagerProps) {
  const [staffList, setStaffList] = useState<StaffAccount[]>(initialStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "hr" | "penilai">("all");

  // Create Staff Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"hr" | "penilai">("hr");
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Edit Staff Modal State
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"hr" | "penilai">("hr");
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Delete Staff Modal State
  const [deletingStaff, setDeletingStaff] = useState<StaffAccount | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Metrics
  const totalCount = staffList.length;
  const hrCount = staffList.filter((s) => s.role === "admin" || s.role === "hr").length;
  const penilaiCount = staffList.filter((s) => s.role === "interviewer" || s.role === "penilai").length;

  // Filtered staff
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === "hr") {
      return s.role === "admin" || s.role === "hr";
    } else if (roleFilter === "penilai") {
      return s.role === "interviewer" || s.role === "penilai";
    }
    return true;
  });

  // Handle Create Staff
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim()) {
      setErrorMsg("Nama dan email wajib diisi.");
      return;
    }

    setLoadingCreate(true);
    setErrorMsg(null);
    const res = await createStaffAccount({
      full_name: createName.trim(),
      email: createEmail.trim(),
      password: createPassword.trim() || "TalentHub2026!",
      role: createRole,
    });
    setLoadingCreate(false);

    if (res.success) {
      const newStaff: StaffAccount = {
        id: `staff-${Date.now()}`,
        full_name: createName.trim(),
        email: createEmail.trim().toLowerCase(),
        role: createRole,
        created_at: new Date().toISOString(),
      };
      setStaffList((prev) => [newStaff, ...prev]);
      setShowCreateModal(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("hr");
      setToastMsg(`Akun staf "${createName.trim()}" berhasil dibuat.`);
      setTimeout(() => setToastMsg(null), 4000);
    } else {
      setErrorMsg(res.error || "Gagal membuat akun staf.");
    }
  };

  // Handle Open Edit
  const handleOpenEdit = (staff: StaffAccount) => {
    setEditingStaff(staff);
    setEditName(staff.full_name);
    setEditRole(staff.role === "interviewer" || staff.role === "penilai" ? "penilai" : "hr");
  };

  // Handle Save Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !editName.trim()) return;

    setLoadingEdit(true);
    setErrorMsg(null);
    const res = await updateStaffAccount(editingStaff.id, {
      full_name: editName.trim(),
      role: editRole,
    });
    setLoadingEdit(false);

    if (res.success) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? { ...s, full_name: editName.trim(), role: editRole }
            : s
        )
      );
      setEditingStaff(null);
      setToastMsg(`Akun "${editName.trim()}" berhasil diperbarui.`);
      setTimeout(() => setToastMsg(null), 4000);
    } else {
      setErrorMsg(res.error || "Gagal memperbarui akun staf.");
    }
  };

  // Handle Delete Staff
  const handleDeleteSubmit = async () => {
    if (!deletingStaff) return;

    setLoadingDelete(true);
    setErrorMsg(null);
    const res = await deleteStaffAccount(deletingStaff.id);
    setLoadingDelete(false);

    if (res.success) {
      setStaffList((prev) => prev.filter((s) => s.id !== deletingStaff.id));
      const deletedName = deletingStaff.full_name;
      setDeletingStaff(null);
      setToastMsg(`Akun staf "${deletedName}" telah dihapus.`);
      setTimeout(() => setToastMsg(null), 4000);
    } else {
      setErrorMsg(res.error || "Gagal menghapus akun staf.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 dark:bg-emerald-900 border border-slate-700 dark:border-emerald-400 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-rose-950 border border-rose-600 text-rose-200 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-xs font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-teal-800/40">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Kelola Akun Staf
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manajemen akun pengguna internal HR dan Tim Penilai.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-semibold text-xs transition-all shadow-2xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-white/90 dark:bg-[#0c2b29]/90 backdrop-blur-md border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Akun Staf</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Pengguna internal terdaftar</p>
        </div>

        <div className="bg-white/90 dark:bg-[#0c2b29]/90 backdrop-blur-md border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tim HR & Recruiter</p>
          <p className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-1">{hrCount}</p>
          <p className="text-[10px] text-teal-600 dark:text-teal-300 mt-0.5">Akses penuh rekrutmen & kanban</p>
        </div>

        <div className="bg-white/90 dark:bg-[#0c2b29]/90 backdrop-blur-md border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tim Penilai & Assessor</p>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">{penilaiCount}</p>
          <p className="text-[10px] text-purple-600 dark:text-purple-300 mt-0.5">Evaluasi & penilaian tes seleksi</p>
        </div>
      </div>

      {/* Navigation Filter & Search Bar */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-3 sm:p-3.5 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-[#061f1d] rounded-xl border border-slate-200 dark:border-emerald-800/60 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                roleFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-emerald-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Semua Staf ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("hr")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                roleFilter === "hr"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-emerald-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Tim HR ({hrCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("penilai")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                roleFilter === "penilai"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-emerald-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Tim Penilai ({penilaiCount})
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email staf..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-[#061f1d] text-slate-700 dark:text-emerald-300 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-emerald-800">
              <tr>
                <th className="px-4 py-3">Nama Lengkap & Staf</th>
                <th className="px-3 py-3">Email Akun</th>
                <th className="px-3 py-3">Peran (Role)</th>
                <th className="px-3 py-3">Hak Akses Sistem</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-emerald-900/60">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data akun staf dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isHr = staff.role === "admin" || staff.role === "hr";

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-[#061f1d]/60 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isHr
                              ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                              : "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          }`}>
                            {staff.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{staff.full_name}</p>
                            <p className="text-[10px] text-slate-500">ID: {staff.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {staff.email}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                            isHr
                              ? "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800"
                              : "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                          }`}
                        >
                          {isHr ? <Shield className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                          <span>{isHr ? "HR / Recruiter" : "Penilai / Assessor"}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[11px] text-slate-600 dark:text-slate-400">
                        {isHr
                          ? "Papan Kanban, Screening CV, Jadwal Seleksi, Nilai HR & User"
                          : "Penilaian Seleksi (Technical Test, Psikotes, Aptitude)"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(staff)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs transition-colors cursor-pointer"
                            title="Edit Data Staf"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingStaff(staff)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs transition-colors cursor-pointer"
                            title="Hapus Akun Staf"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c2b29] border border-slate-300 dark:border-emerald-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-slate-800 dark:text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Tambah Akun Staf Baru</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Nama Lengkap Staf *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Contoh: Sarah Wijaya / Dr. Bambang"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Email Akun Staf *
                </label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="Contoh: sarah@talenthub.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Password Awal (Opsional)
                </label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Default: TalentHub2026!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Peran / Hak Akses (Role) *
                </label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as "hr" | "penilai")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                >
                  <option value="hr">Tim HR & Recruiter (Kelola Lowongan, Kanban, Screening)</option>
                  <option value="penilai">Tim Penilai & Assessor (Evaluasi & Nilai Ujian Tes)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-emerald-800 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingCreate}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {loadingCreate && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Akun Staf</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c2b29] border border-slate-300 dark:border-emerald-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-slate-800 dark:text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Edit Data Staf</h3>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Email Akun (Tetap):</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{editingStaff.email}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Nama Lengkap Staf *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Peran / Hak Akses (Role) *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "hr" | "penilai")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                >
                  <option value="hr">Tim HR & Recruiter (Kelola Lowongan, Kanban, Screening)</option>
                  <option value="penilai">Tim Penilai & Assessor (Evaluasi & Nilai Ujian Tes)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-emerald-800 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingEdit}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {loadingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Confirm Delete Modal */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c2b29] border border-rose-300 dark:border-rose-800/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-700/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Hapus Akun Staf?</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Apakah Anda yakin ingin menghapus akun staf <strong>{deletingStaff.full_name}</strong> ({deletingStaff.email})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-950 border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loadingDelete}
                onClick={handleDeleteSubmit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loadingDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Ya, Hapus Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
