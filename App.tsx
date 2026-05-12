
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Instagram, 
  User, 
  Globe,
  ArrowRight,
  Film,
  Newspaper,
  Mic2,
  BookOpen,
  Mail,
  Calendar,
  Star,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Layout,
  Save,
  X,
  Settings,
  Upload,
  Image,
  Copy
} from 'lucide-react';

// --- Types ---
interface Article {
  id: number;
  title: string;
  author: string;
  date: string;
  summary: string;
  imageUrl: string;
  category: 'news' | 'festival' | 'texts' | 'interview';
  rating?: number;
  content?: string;
}

interface UploadedImage {
  name: string;
  url: string;
}

// --- Data ---
const INITIAL_ARTICLES: Article[] = [];

const isDev = import.meta.env.DEV;

async function loadArticles(): Promise<Article[]> {
  const res = await fetch(import.meta.env.BASE_URL + 'articles.json');
  return res.json();
}

async function saveArticles(articles: Article[]) {
  if (!isDev) return;
  await fetch('/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articles, null, 2)
  });
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  // 返回带 base 路径的 URL，确保开发和生产环境都能访问
  return import.meta.env.BASE_URL + data.url.replace(/^\//, '');
}

async function listImages(): Promise<UploadedImage[]> {
  if (!isDev) return [];
  const res = await fetch('/api/images');
  const images = await res.json();
  return images.map((img: UploadedImage) => ({
    ...img,
    url: import.meta.env.BASE_URL + img.url.replace(/^\//, '')
  }));
}

// --- Components ---

const Navbar = ({ onNavigate, activePath }: { onNavigate: (path: string) => void, activePath: string }) => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b-4 border-[#E70012]">
      <div 
        className="cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
        onClick={() => onNavigate('home')}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img src={import.meta.env.BASE_URL + 'logo.jpg'} alt="PaperBullet" className="w-full h-full object-cover" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-[#E70012] brutalist-font uppercase"></span>
      </div>
      
      <div className="hidden md:flex items-center gap-6">
        {[
          { label: '最新资讯', path: 'news' },
          { label: '电影节报道', path: 'festival' },
          { label: '深度文章', path: 'texts' },
          { label: '访谈', path: 'interview' },
          { label: '联系我们', path: 'contact' }
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`text-xs font-bold uppercase tracking-widest transition-all px-4 py-2 rounded-full ${
              activePath === item.path 
                ? 'bg-[#E70012] text-white' 
                : 'text-[#E70012] hover:bg-[#E70012]/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="min-h-[70vh] flex flex-col justify-center pt-64 pb-32 px-6 md:px-20 border-b-4 border-[#E70012] bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 pt-6"
        >
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-[#E70012] leading-[0.85] brutalist-font">
            枪稿
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            <p className="text-xl md:text-3xl text-[#E70012] font-bold leading-tight">
              隐姓不埋名字，缴械不投降
            </p>
            <p className="text-base text-[#E70012]/70 font-medium leading-relaxed">
              PaperBullet 是一个致力于严谨影评、电影节报道以及与塑造当代电影的创作者进行深度对话的平台。我们相信影像的力量能够挑战、启发并触动人心。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ArticleCard: React.FC<{ article: Article, onClick: () => void }> = ({ article, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden mb-6 bg-[#E70012]/5 rounded-3xl border-2 border-[#E70012]/10 relative">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white text-[#E70012] px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#E70012]">
            {article.category === 'news' ? '资讯' : article.category === 'festival' ? '电影节' : article.category === 'texts' ? '文章' : '访谈'}
          </span>
        </div>
        {article.rating && (
          <div className="absolute bottom-4 right-4 bg-[#E70012] text-white px-3 py-1 rounded-full flex items-center gap-1">
            <Star size={12} fill="white" />
            <span className="text-xs font-black">{article.rating}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3 px-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-[#E70012] group-hover:underline decoration-4 underline-offset-4">{article.title}</h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-[#E70012]/50 uppercase tracking-widest">
          <span className="flex items-center gap-1"><User size={12} /> {article.author}</span>
          <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
        </div>
        <p className="text-sm text-[#E70012]/70 leading-relaxed font-medium line-clamp-2">{article.summary}</p>
        <div className="pt-2 flex items-center gap-2 text-[#E70012] font-black text-xs uppercase group-hover:gap-4 transition-all">
          阅读更多 <ArrowRight size={14} />
        </div>
      </div>
    </motion.div>
  );
};

const SectionHeader = ({ title, subtitle, onAction }: { title: string, subtitle: string, icon?: any, onAction?: () => void }) => (
  <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-[#E70012]">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter brutalist-font">{title}</h2>
      </div>
      <p className="text-lg text-[#E70012]/60 font-bold max-w-xl">{subtitle}</p>
    </div>
    {onAction && (
      <button 
        onClick={onAction}
        className="flex items-center gap-2 bg-[#E70012] text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
      >
        查看全部 <ChevronRight size={16} />
      </button>
    )}
  </div>
);

const ArticlePage = ({ article, onBack }: { article: Article, onBack: () => void }) => (
  <section className="py-32 px-6 md:px-20 bg-white min-h-screen pt-28">
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#E70012] font-black uppercase text-xs tracking-widest mb-12 hover:gap-4 transition-all"
      >
        <ArrowRight className="rotate-180" size={14} /> 返回
      </button>

      <div className="flex items-center gap-4 mb-6">
        <span className="bg-[#E70012] text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
          {article.category === 'news' ? '资讯' : article.category === 'festival' ? '电影节' : article.category === 'texts' ? '文章' : '访谈'}
        </span>
        <span className="text-[10px] font-bold text-[#E70012]/40 uppercase tracking-widest">
          {article.date} • {article.author}
        </span>
      </div>

      <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-[#E70012] mb-12 leading-none brutalist-font">
        {article.title}
      </h1>

      <div className="aspect-[4/3] overflow-hidden mb-12">
        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-red max-w-none prose-headings:text-[#E70012] prose-p:text-[#E70012]/80 prose-p:text-lg prose-p:leading-relaxed">
        <div dangerouslySetInnerHTML={{ __html: article.content || article.summary }} />
      </div>

      <div className="mt-16 pt-8 border-t-2 border-[#E70012]/10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#E70012] font-black uppercase text-xs tracking-widest hover:gap-4 transition-all"
        >
          <ArrowRight className="rotate-180" size={14} /> 返回
        </button>
      </div>
    </div>
  </section>
);

const NewsSection = ({ articles, onArticleClick, onAction }: { articles: Article[], onArticleClick: (a: Article) => void, onAction?: () => void }) => (
  <section className="pt-32 pb-24 px-6 md:px-20 bg-white border-b-4 border-[#E70012]">
    <SectionHeader 
      title="最新资讯" 
      subtitle="" 
      icon={Newspaper} 
      onAction={onAction}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {articles.filter(a => a.category === 'news').map(article => (
        <ArticleCard key={article.id} article={article} onClick={() => onArticleClick(article)} />
      ))}
    </div>
  </section>
);

const FestivalSection = ({ articles, onArticleClick, onAction }: { articles: Article[], onArticleClick: (a: Article) => void, onAction?: () => void }) => (
  <section className="pt-32 pb-24 px-6 md:px-20 bg-[#E70012]/5 border-b-4 border-[#E70012]">
    <SectionHeader 
      title="电影节报道" 
      subtitle="" 
      icon={Globe} 
      onAction={onAction}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {articles.filter(a => a.category === 'festival').map(article => (
        <ArticleCard key={article.id} article={article} onClick={() => onArticleClick(article)} />
      ))}
    </div>
  </section>
);

const TextsSection = ({ articles, onArticleClick, onAction }: { articles: Article[], onArticleClick: (a: Article) => void, onAction?: () => void }) => (
  <section className="pt-32 pb-24 px-6 md:px-20 bg-white border-b-4 border-[#E70012]">
    <SectionHeader 
      title="深度文章" 
      subtitle="" 
      icon={BookOpen} 
      onAction={onAction}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      {articles.filter(a => a.category === 'texts').map(article => (
        <div key={article.id} className="flex flex-col md:flex-row gap-8 group cursor-pointer" onClick={() => onArticleClick(article)}>
          <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden border-2 border-[#E70012]/10">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="w-full md:w-1/2 space-y-4 flex flex-col justify-center">
            <span className="text-[10px] font-black text-[#E70012] uppercase tracking-[0.3em]">{article.date}</span>
            <h3 className="text-xl font-black uppercase leading-none text-[#E70012] group-hover:underline decoration-4 underline-offset-4">{article.title}</h3>
            <p className="text-sm text-[#E70012]/60 font-medium leading-relaxed">{article.summary}</p>
            <div className="flex items-center gap-2 text-[#E70012] font-black text-xs uppercase">
              阅读全文 <ArrowRight size={14} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const InterviewSection = ({ articles, onArticleClick, onAction }: { articles: Article[], onArticleClick: (a: Article) => void, onAction?: () => void }) => (
  <section className="pt-32 pb-24 px-6 md:px-20 bg-[#E70012] text-white">
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter brutalist-font">访谈</h2>
      </div>
      <p className="text-lg opacity-80 font-bold max-w-xl"></p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {articles.filter(a => a.category === 'interview').map(article => (
        <motion.div 
          key={article.id}
          whileHover={{ y: -10 }}
          className="bg-white p-8 rounded-[2rem] text-[#E70012] space-y-6 cursor-pointer"
          onClick={() => onArticleClick(article)}
        >
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#E70012]">
            <img src={article.imageUrl} alt={article.author} className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-black uppercase leading-tight">{article.title}</h3>
          <p className="text-sm font-medium opacity-70">{article.summary}</p>
          <button className="w-full py-4 rounded-2xl bg-[#E70012] text-white font-black uppercase text-xs tracking-widest hover:scale-95 transition-transform">
            阅读访谈
          </button>
        </motion.div>
      ))}
    </div>
  </section>
);

const AdminGate = (props: { articles: Article[], onAdd: (a: Article) => void, onDelete: (id: number) => void, onUpdate: (a: Article) => void, onNavigate: (path: string) => void }) => {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'bage') {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (authenticated) return <AdminDashboard {...props} />;

  return (
    <section className="pt-32 pb-32 px-6 md:px-20 bg-white min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-6 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[#E70012] brutalist-font">管理后台</h2>
        <input
          type="password"
          placeholder="请输入密码"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          className="w-full p-4 rounded-2xl border-2 border-[#E70012]/20 focus:border-[#E70012] outline-none font-bold text-[#E70012] bg-white text-center"
        />
        {error && <p className="text-[#E70012] text-sm font-bold">密码错误，请重试</p>}
        <button type="submit" className="w-full py-4 bg-[#E70012] text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">
          登录
        </button>
      </form>
    </section>
  );
};

const AdminDashboard = ({ articles, onAdd, onDelete, onUpdate, onNavigate }: { articles: Article[], onAdd: (a: Article) => void, onDelete: (id: number) => void, onUpdate: (a: Article) => void, onNavigate: (path: string) => void }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showImageLib, setShowImageLib] = useState(false);
  const [imageLib, setImageLib] = useState<UploadedImage[]>([]);

  useEffect(() => {
    listImages().then(setImageLib);
  }, []);
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    category: 'news',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    summary: '',
    content: '',
    author: 'Admin'
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const editorRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current = formData.content || '';
    if (editorRef.current && !showSource) {
      editorRef.current.innerHTML = contentRef.current;
    }
  }, [showSource, editingId, isAdding]);

  const execCmd = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    syncEditor();
  };

  const syncEditor = () => {
    if (editorRef.current) {
      contentRef.current = editorRef.current.innerHTML;
    }
  };

  const contentRef = React.useRef(formData.content || '');

  const insertHtmlAtCursor = (html: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('insertHTML', false, html);
    syncEditor();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    syncEditor();
    const finalContent = showSource ? formData.content : contentRef.current;
    const finalData = { ...formData, content: finalContent } as Article;
    if (editingId) {
      onUpdate({ ...finalData, id: editingId });
      setEditingId(null);
      showToast('文章更新成功！');
    } else {
      onAdd({ ...finalData, id: Date.now() });
      showToast('文章发布成功！');
    }
    setIsAdding(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('您确定要删除这篇文章吗？')) {
      onDelete(id);
      showToast('文章删除成功！');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'news',
      date: new Date().toISOString().split('T')[0],
      imageUrl: '',
      summary: '',
      content: '',
      author: 'Admin'
    });
  };

  const startEdit = (article: Article) => {
    setFormData(article);
    setEditingId(article.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelAction = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <section className="pt-32 pb-32 px-6 md:px-20 bg-white min-h-screen relative">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-[#E70012] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl flex items-center gap-3"
          >
            <Star size={20} fill="white" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="space-y-2">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#E70012] brutalist-font">管理后台</h2>
            <p className="text-lg text-[#E70012]/60 font-bold uppercase tracking-widest">内容管理 / MANAGE CONTENT</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 border-4 border-[#E70012] text-[#E70012] px-8 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:bg-[#E70012] hover:text-white transition-all shadow-lg"
            >
              <ArrowRight className="rotate-180" size={20} />
              返回首页
            </button>
            <button 
              onClick={() => isAdding ? cancelAction() : setIsAdding(true)}
              className="flex items-center gap-2 bg-[#E70012] text-white px-8 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-xl"
            >
              {isAdding ? <X size={20} /> : <Plus size={20} />}
              {isAdding ? '取消' : '新建文章'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-20"
            >
              <form onSubmit={handleSubmit} className="bg-[#E70012]/5 p-8 md:p-12 rounded-[3rem] border-4 border-[#E70012] space-y-8">
                <h3 className="text-3xl font-black uppercase text-[#E70012] border-b-2 border-[#E70012] pb-4">
                  {editingId ? 'Edit Article / 编辑文章' : 'Create Article / 创建文章'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#E70012]">文章类型 / Article Type</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full p-4 rounded-2xl border-2 border-[#E70012]/20 focus:border-[#E70012] outline-none font-bold text-[#E70012] bg-white transition-all"
                    >
                      <option value="news">最新资讯 / Latest News</option>
                      <option value="festival">电影节 / Film Festival</option>
                      <option value="texts">深度文章 / Deep Texts</option>
                      <option value="interview">专访 / Interview</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#E70012]">发布日期 / Publish Date</label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-4 rounded-2xl border-2 border-[#E70012]/20 focus:border-[#E70012] outline-none font-bold text-[#E70012] bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#E70012]">作者 / Author</label>
                    <input 
                      type="text" 
                      placeholder="作者名"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full p-4 rounded-2xl border-2 border-[#E70012]/20 focus:border-[#E70012] outline-none font-bold text-[#E70012] bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[#E70012]">文章标题 / Article Title</label>
                  <input 
                    type="text" 
                    placeholder="输入一个引人注目的标题..."
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-4 rounded-2xl border-2 border-[#E70012]/20 focus:border-[#E70012] outline-none font-bold text-[#E70012] bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[#E70012]">封面图片 / Cover Image</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="输入URL 或 上传本地图片"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="flex-1 p-4 rounded-2xl border-2 border-[#E70012]/20 focus:border-[#E70012] outline-none font-bold text-[#E70012] bg-white transition-all"
                      required
                    />
                    <label className="flex items-center gap-2 px-6 py-4 bg-[#E70012] text-white rounded-2xl font-black uppercase text-xs tracking-widest cursor-pointer hover:scale-105 transition-transform">
                      <Upload size={16} />
                      上传
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImage(file);
                        setFormData({...formData, imageUrl: url});
                        showToast('封面图片上传成功！');
                      }} />
                    </label>
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-3 w-40 h-28 rounded-xl overflow-hidden border-2 border-[#E70012]/20">
                      <img src={formData.imageUrl} alt="封面预览" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[#E70012]">内容摘要 / Summary</label>
                  <textarea 
                    rows={3}
                    placeholder="文章的简要概述..."
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    className="w-full p-4 rounded-2xl border-2 border-[#E70012]/20 focus:border-[#E70012] outline-none font-bold text-[#E70012] bg-white transition-all resize-none"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-widest text-[#E70012]">内容正文 / Content</label>
                    <button 
                      type="button"
                      onClick={() => {
                        if (!showSource) {
                          // switching to source: sync editor content to formData
                          syncEditor();
                          setFormData(prev => ({...prev, content: contentRef.current}));
                        } else {
                          // switching to rich text: contentRef will be set by useEffect
                          contentRef.current = formData.content || '';
                        }
                        setShowSource(!showSource);
                      }}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E70012] hover:underline"
                    >
                      {showSource ? <Eye size={14} /> : <Edit3 size={14} />}
                      {showSource ? '富文本模式' : 'HTML源码'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 p-3 rounded-2xl border-2 border-[#E70012]/20 bg-white">
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('bold'); }} className="px-3 py-1.5 text-xs font-black text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="加粗">B</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('italic'); }} className="px-3 py-1.5 text-xs italic font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="斜体">I</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('strikeThrough'); }} className="px-3 py-1.5 text-xs line-through font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="删除线">S</button>
                    <span className="w-px h-5 bg-[#E70012]/20 mx-1"></span>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', '<h1>'); }} className="px-3 py-1.5 text-xs font-black text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="标题1">H1</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', '<h2>'); }} className="px-3 py-1.5 text-xs font-black text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="标题2">H2</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', '<h3>'); }} className="px-3 py-1.5 text-xs font-black text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="标题3">H3</button>
                    <span className="w-px h-5 bg-[#E70012]/20 mx-1"></span>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', '<blockquote>'); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="引用">“”</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertHorizontalRule'); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="分割线">—</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); const url = prompt('链接地址', 'https://'); if (url) execCmd('createLink', url); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="链接">🔗</button>
                    <span className="w-px h-5 bg-[#E70012]/20 mx-1"></span>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="无序列表">•列表</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertOrderedList'); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="有序列表">1.列表</button>
                    <span className="w-px h-5 bg-[#E70012]/20 mx-1"></span>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('justifyLeft'); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="左对齐">←</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('justifyCenter'); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="居中">↔</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('justifyRight'); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="右对齐">→</button>
                    <span className="w-px h-5 bg-[#E70012]/20 mx-1"></span>
                    <button type="button" onMouseDown={e => { e.preventDefault(); insertHtmlAtCursor('<br>'); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="换行">↵换行</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); insertHtmlAtCursor('<p><br></p>'); }} className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg" title="空行">↵空行</button>
                    <span className="w-px h-5 bg-[#E70012]/20 mx-1"></span>
                    <label className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg cursor-pointer" title="上传图片">
                      🖼️ 上传
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImage(file);
                        const width = prompt('图片宽度(px，留空为100%)', '');
                        const caption = prompt('图片备注(留空则不添加)', '');
                        let imgTag = width ? `<img src="${url}" alt="${file.name}" width="${width}" />` : `<img src="${url}" alt="${file.name}" style="max-width:100%" />`;
                        if (caption) imgTag = `<figure>${imgTag}<figcaption style="text-align:center;font-size:12px;color:#999;margin-top:6px">${caption}</figcaption></figure>`;
                        insertHtmlAtCursor(imgTag);
                        showToast('图片已插入！');
                      }} />
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowImageLib(!showImageLib)}
                      className="px-3 py-1.5 text-xs font-bold text-[#E70012] hover:bg-[#E70012]/10 rounded-lg"
                      title="图片库"
                    >
                      🖼️ 图片库
                    </button>
                  </div>

                  {showImageLib && (
                    <div className="p-4 rounded-2xl border-2 border-[#E70012]/20 bg-white">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black uppercase tracking-widest text-[#E70012]">已上传图片 / Image Library</span>
                        <button type="button" onClick={() => setShowImageLib(false)} className="text-[#E70012]"><X size={16} /></button>
                      </div>
                      {imageLib.length === 0 ? (
                        <p className="text-sm text-[#E70012]/50">暂无图片，请先上传</p>
                      ) : (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto">
                          {imageLib.map(img => (
                            <div key={img.name} className="relative group cursor-pointer" onClick={() => {
                              const width = prompt('图片宽度(px，留空为100%)', '');
                              const caption = prompt('图片备注(留空则不添加)', '');
                              let imgTag = width ? `<img src="${img.url}" alt="${img.name}" width="${width}" />` : `<img src="${img.url}" alt="${img.name}" style="max-width:100%" />`;
                              if (caption) imgTag = `<figure>${imgTag}<figcaption style="text-align:center;font-size:12px;color:#999;margin-top:6px">${caption}</figcaption></figure>`;
                              insertHtmlAtCursor(imgTag);
                              showToast('图片已插入！');
                            }}>
                              <img src={img.url} alt={img.name} className="w-full aspect-square object-cover rounded-lg border-2 border-transparent group-hover:border-[#E70012] transition-all" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {showSource ? (
                    <textarea 
                      id="content-editor"
                      rows={12}
                      placeholder="在这里编辑源码..."
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full p-6 rounded-2xl border-2 border-[#E70012]/20 focus:border-[#E70012] outline-none font-mono text-sm text-[#E70012] bg-white transition-all"
                    />
                  ) : (
                    <div 
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={syncEditor}
                      onBlur={syncEditor}
                      className="w-full p-8 rounded-2xl border-2 border-[#E70012]/20 focus:border-[#E70012] outline-none bg-white min-h-[300px] prose prose-red max-w-none prose-headings:text-[#E70012] prose-p:text-[#E70012]/80 cursor-text"
                    ></div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-[#E70012] text-white rounded-2xl font-black uppercase text-lg tracking-[0.2em] hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                >
                  <Save size={24} />
                  {editingId ? 'Update Article / 更新文章' : 'Publish Article / 发布文章'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <h3 className="text-2xl font-black uppercase tracking-widest text-[#E70012] mb-8 flex items-center gap-3">
            <Layout size={24} /> Existing Articles / 已发布文章
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-6 bg-white border-2 border-[#E70012]/10 rounded-2xl hover:border-[#E70012] transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#E70012]/5">
                    <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#E70012]/40">
                      {article.category === 'news' ? '资讯' : article.category === 'festival' ? '电影节' : article.category === 'texts' ? '文章' : '访谈'} • {article.date}
                    </span>
                    <h4 className="text-xl font-black uppercase text-[#E70012] leading-none mt-1">{article.title}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => startEdit(article)}
                    className="p-3 rounded-xl text-[#E70012] hover:bg-[#E70012] hover:text-white transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(article.id)}
                    className="p-3 rounded-xl text-[#E70012] hover:bg-[#E70012] hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => (
  <section className="pt-32 pb-32 px-6 md:px-20 text-center bg-white">
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-8">
        <img src={import.meta.env.BASE_URL + 'logo.jpg'} alt="Logo" className="w-full h-full object-cover" />
      </div>
      <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[#E70012] brutalist-font">联系我们</h2>
      <p className="text-xl md:text-2xl text-[#E70012]/70 font-bold max-w-2xl mx-auto">
        关于编辑垂询、合作请求或电影交流，欢迎随时联系。
      </p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <a href="mailto:hello@cineround.com" className="w-full md:w-auto px-6 py-3 bg-[#E70012] text-white rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">
          发送邮件
        </a>

      </div>
    </div>
  </section>
);

const Footer = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
  <footer className="py-24 px-6 md:px-20 bg-white text-[#E70012] border-t-8 border-[#E70012]">
    <div className="flex flex-col md:flex-row justify-between items-center gap-24">
      <div className="space-y-8 max-w-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img src={import.meta.env.BASE_URL + 'logo.jpg'} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none brutalist-font">
            PaperBullet
          </h2>
        </div>

      </div>
      
      <div className="flex flex-col justify-end space-y-16 ml-auto">
        <div className="grid grid-cols-2 gap-16 md:gap-32">

          <div className="space-y-6">
            <ul className="space-y-4 text-[#E70012] text-sm font-black uppercase">
              <li className="hover:underline cursor-pointer" onClick={() => onNavigate('contact')}>联系我们</li>
            </ul>
            <ul className="space-y-2 text-[#E70012]/60 text-xs font-medium">
              <li>微博：@枪稿</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const [activePath, setActivePath] = useState(() => {
    return window.location.hash.replace('#', '') || 'home';
  });
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [prevPath, setPrevPath] = useState('home');

  useEffect(() => {
    loadArticles().then(setArticles);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setActivePath(hash);

      if (hash.includes('/')) {
        const id = parseInt(hash.split('/')[1]);
        const found = articles.find(a => a.id === id);
        if (found) setSelectedArticle(found);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [articles]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setPrevPath(activePath);
    navigate(article.category + '/' + article.id);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePath]);

  const handleAddArticle = (newArticle: Article) => {
    const updated = [newArticle, ...articles];
    setArticles(updated);
    saveArticles(updated);
  };

  const handleDeleteArticle = (id: number) => {
    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    saveArticles(updated);
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    const updated = articles.map(a => a.id === updatedArticle.id ? updatedArticle : a);
    setArticles(updated);
    saveArticles(updated);
  };

  return (
    <div className="relative overflow-x-hidden min-h-screen selection:bg-[#E70012] selection:text-white bg-white">
      <Navbar onNavigate={navigate} activePath={activePath} />
      
      <main className="">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePath}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {activePath === 'home' && (
              <>
                <Hero />
                <NewsSection articles={articles} onArticleClick={handleArticleClick} onAction={() => navigate('news')} />
                <FestivalSection articles={articles} onArticleClick={handleArticleClick} onAction={() => navigate('festival')} />
                <TextsSection articles={articles} onArticleClick={handleArticleClick} onAction={() => navigate('texts')} />
                <InterviewSection articles={articles} onArticleClick={handleArticleClick} onAction={() => navigate('interview')} />
                <ContactSection />
              </>
            )}

            {activePath === 'news' && <NewsSection articles={articles} onArticleClick={handleArticleClick} />}
            {activePath === 'festival' && <FestivalSection articles={articles} onArticleClick={handleArticleClick} />}
            {activePath === 'texts' && <TextsSection articles={articles} onArticleClick={handleArticleClick} />}
            {activePath === 'interview' && <InterviewSection articles={articles} onArticleClick={handleArticleClick} />}
            {activePath === 'contact' && <ContactSection />}
            {activePath === 'admin' && (
              <AdminGate 
                articles={articles} 
                onAdd={handleAddArticle} 
                onDelete={handleDeleteArticle} 
                onUpdate={handleUpdateArticle}
                onNavigate={navigate}
              />
            )}
            {activePath.includes('/') && selectedArticle && (
              <ArticlePage article={selectedArticle} onBack={() => navigate(prevPath)} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
};

export default App;
