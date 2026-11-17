import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  MessageSquare,
  Send,
  Flag,
  Trash2,
  Lock,
  Sparkles,
  Award,
  CheckCircle2,
  ChevronLeft,
  Smile,
  AlertTriangle,
} from 'lucide-react';

export interface CommunityMember {
  id: string;
  memberCode: string;
  name: string;
  avatar: string;
  city: string;
  bio: string;
  badges: string[];
  isFriend: boolean;
  friendRequestStatus?: 'none' | 'sent' | 'received';
  isBlocked?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

const INITIAL_MEMBERS: CommunityMember[] = [
  {
    id: 'mem_1',
    memberCode: 'AM-7721',
    name: 'Ahmad Fauzi',
    avatar: '👨‍💼',
    city: 'Jakarta Selatan',
    bio: 'Pencari ridho Allah. Sedang menyelesaikan hafalan Juz 30.',
    badges: ['Pejuang Subuh', 'Khatam 30 Juz', 'Anggota Aktif'],
    isFriend: true,
  },
  {
    id: 'mem_2',
    memberCode: 'AM-4412',
    name: 'Siti Nurhaliza',
    avatar: '🧕',
    city: 'Bandung',
    bio: 'Ibu 2 anak, belajar tahsin bersama keluarga.',
    badges: ['Tahsin Istiqomah', 'Keluarga Berkah'],
    isFriend: false,
    friendRequestStatus: 'received',
  },
  {
    id: 'mem_3',
    memberCode: 'AM-9903',
    name: 'Rizky Ramadhan',
    avatar: '🧔',
    city: 'Surabaya',
    bio: 'Menuntut ilmu fiqih dan hadis.',
    badges: ['Pecinta Hadis'],
    isFriend: false,
    friendRequestStatus: 'none',
  },
  {
    id: 'mem_4',
    memberCode: 'AM-2209',
    name: 'Zahra Humaira',
    avatar: '👧',
    city: 'Yogyakarta',
    bio: 'Semangat belajar Iqra jilid 5.',
    badges: ['Santri Cilik', 'Hafidz Cilik'],
    isFriend: false,
    friendRequestStatus: 'none',
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    senderId: 'mem_1',
    receiverId: 'my_user',
    text: "Assalamu'alaikum akhi, apakah besok ada kajian subuh di masjid sekitar?",
    timestamp: '05:45',
    isRead: true,
  },
  {
    id: 'msg_2',
    senderId: 'my_user',
    receiverId: 'mem_1',
    text: "Wa'alaikumussalam warahmatullah. InsyaAllah ada, setelah sholat Subuh berjamaah.",
    timestamp: '05:48',
    isRead: true,
  },
];

export const MuslimCommunityModule: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { mode } = useApp();
  const isAnakMode = mode === 'anak';

  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests' | 'chat'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<CommunityMember[]>(() => {
    const saved = localStorage.getItem('akumuslim_community_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('akumuslim_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });
  const [selectedChatMember, setSelectedChatMember] = useState<CommunityMember | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [reportModalMember, setReportModalMember] = useState<CommunityMember | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem('akumuslim_community_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('akumuslim_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Friend actions
  const sendFriendRequest = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, friendRequestStatus: 'sent' } : m))
    );
  };

  const acceptFriendRequest = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isFriend: true, friendRequestStatus: 'none' } : m
      )
    );
  };

  const rejectFriendRequest = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isFriend: false, friendRequestStatus: 'none' } : m
      )
    );
  };

  const removeFriend = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFriend: false } : m))
    );
    if (selectedChatMember?.id === id) {
      setSelectedChatMember(null);
    }
  };

  const blockUser = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isBlocked: true, isFriend: false } : m
      )
    );
    if (selectedChatMember?.id === id) {
      setSelectedChatMember(null);
    }
  };

  const unblockUser = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isBlocked: false } : m))
    );
  };

  // Messaging
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim() || !selectedChatMember) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'my_user',
      receiverId: selectedChatMember.id,
      text: chatInputText.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInputText('');
  };

  const sendPresetGreeting = (phrase: string) => {
    setChatInputText((prev) => (prev ? `${prev} ${phrase}` : phrase));
  };

  const deleteConversation = (memberId: string) => {
    setMessages((prev) =>
      prev.filter(
        (m) =>
          !(
            (m.senderId === memberId && m.receiverId === 'my_user') ||
            (m.senderId === 'my_user' && m.receiverId === memberId)
          )
      )
    );
  };

  const submitReport = () => {
    if (!reportModalMember) return;
    setReportSubmitted(true);
    setTimeout(() => {
      setReportModalMember(null);
      setReportSubmitted(false);
      setReportReason('');
    }, 1500);
  };

  const friendsList = members.filter((m) => m.isFriend && !m.isBlocked);
  const pendingRequests = members.filter((m) => m.friendRequestStatus === 'received' && !m.isBlocked);
  const searchResults = members.filter(
    (m) =>
      !m.isBlocked &&
      (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-stone-900 dark:text-white">
              Komunitas Sahabat Muslim
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Silaturahmi Islami Santun & Terarah · Tanpa Algoritma Sosmed Publik
            </p>
          </div>
        </div>
      </div>

      {/* Child Protection Banner */}
      {isAnakMode ? (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold text-sm">Mode Anak Aktif — Perlindungan Privasi Penuh</p>
            <p>
              Fitur percakapan privat dengan orang luar dinonaktifkan demi keselamatan putra-putri Anda. Interaksi hanya diizinkan dengan keluarga terdaftar di Dashboard Keluarga.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Privasi Terjamin:</strong> Tidak ada linimasa (feed), likes, atau konten viral publik. Hanya percakapan silaturahmi 1-lawan-1 yang santun.
          </span>
        </div>
      )}

      {/* Child safety lock out if anak mode */}
      {isAnakMode ? (
        <div className="p-8 text-center bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
          <Lock className="w-12 h-12 text-stone-400 mx-auto" />
          <h2 className="text-base font-bold text-stone-800 dark:text-stone-200">
            Akses Dibatasi Oleh Orang Tua
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Untuk mengaktifkan silaturahmi komunitas, mintalah bantuan Orang Tua untuk mengubah mode di menu Profil atau Dashboard Keluarga.
          </p>
        </div>
      ) : selectedChatMember ? (
        /* 1-on-1 Chat View */
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm flex flex-col h-[520px]">
          {/* Chat Header */}
          <div className="p-3 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSelectedChatMember(null)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-2xl">{selectedChatMember.avatar}</div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                    {selectedChatMember.name}
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                    {selectedChatMember.memberCode}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">{selectedChatMember.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setReportModalMember(selectedChatMember)}
                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                title="Laporkan Anggota"
              >
                <Flag className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteConversation(selectedChatMember.id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                title="Hapus Pesan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-100/50 dark:bg-stone-950/30">
            {messages
              .filter(
                (m) =>
                  (m.senderId === selectedChatMember.id && m.receiverId === 'my_user') ||
                  (m.senderId === 'my_user' && m.receiverId === selectedChatMember.id)
              )
              .map((msg) => {
                const isMe = msg.senderId === 'my_user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[9px] mt-1 block text-right ${
                          isMe ? 'text-emerald-200' : 'text-stone-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Islamic Quick Phrases */}
          <div className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-200 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-stone-400 shrink-0 flex items-center gap-1 font-semibold">
              <Smile className="w-3.5 h-3.5" /> Kalimat Santun:
            </span>
            {[
              "Assalamu'alaikum",
              "Wa'alaikumussalam",
              'Jazakallahu khairan',
              'Barakallahu feek',
              'InsyaAllah',
              'Alhamdulillah',
            ].map((phrase) => (
              <button
                key={phrase}
                onClick={() => sendPresetGreeting(phrase)}
                className="px-2 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500 whitespace-nowrap"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              placeholder="Tulis pesan silaturahmi yang santun..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!chatInputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Main Community Tabs */
        <div className="space-y-4">
          <div className="flex border-b border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
                activeTab === 'friends'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Sahabat ({friendsList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
                activeTab === 'search'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cari Anggota</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 relative ${
                activeTab === 'requests'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Permintaan</span>
              {pendingRequests.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Friends List Tab */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {friendsList.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">Belum ada sahabat yang terhubung.</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Cari Sahabat Muslim
                  </button>
                </div>
              ) : (
                friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{friend.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                            {friend.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                            {friend.memberCode}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{friend.bio}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {friend.badges.map((b) => (
                            <span
                              key={b}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 flex items-center gap-1 font-medium"
                            >
                              <Award className="w-3 h-3 text-amber-600" />
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedChatMember(friend)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Kirim Pesan</span>
                      </button>
                      <button
                        onClick={() => removeFriend(friend.id)}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-stone-700"
                        title="Hapus Pertemanan"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama, kota, atau ID Anggota (cth: AM-7721)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2.5">
                {searchResults.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{member.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-stone-900 dark:text-white">
                            {member.name}
                          </h4>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {member.memberCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">{member.city}</p>
                      </div>
                    </div>

                    <div>
                      {member.isFriend ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sahabat
                        </span>
                      ) : member.friendRequestStatus === 'sent' ? (
                        <span className="text-[11px] text-stone-400">Menunggu...</span>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(member.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Tambah</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <UserCheck className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">Tidak ada permintaan pertemanan tertunda.</p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{req.avatar}</div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900 dark:text-white">
                          {req.name}
                        </h4>
                        <p className="text-[11px] text-stone-500">{req.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => acceptFriendRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-200"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Safety Reporting Modal */}
      {reportModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Laporkan Anggota Komunitas</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Laporkan perilaku tidak santun atau pelanggaran adab Islam oleh <strong>{reportModalMember.name}</strong>. Tim moderasi AKU MUSLIM akan meninjau dalam 24 jam.
            </p>

            {reportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                ✓ Laporan berhasil dikirim. Terima kasih telah menjaga keasrian komunitas.
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Jelaskan alasan laporan (kata-kata kasar, spam, promosi komersial tak berizin)..."
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:border-amber-500"
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => blockUser(reportModalMember.id)}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold"
                  >
                    Blokir Anggota Ini
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReportModalMember(null)}
                      className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700"
                    >
                      Batal
                    </button>
                    <button
                      onClick={submitReport}
                      disabled={!reportReason.trim()}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold"
                    >
                      Kirim Laporan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
