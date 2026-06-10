import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './views/Home';
import CropDoctor from './views/CropDoctor';
import HealthHelper from './views/HealthHelper';
import VillageHelp from './views/VillageHelp';
import { voiceService } from './lib/voice';
import { generateResponse } from './lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import Community from './views/Community';
import SavedRecords from './views/SavedRecords';
import HealthHistory from './views/HealthHistory';
import FieldLocator from './views/FieldLocator';
import MandiPrices from './views/MandiPrices';
import WeatherDetail from './views/WeatherDetail';
import KnowledgeHub from './views/KnowledgeHub';
import NewsSection from './views/NewsSection';
import LivestockDoctor from './views/LivestockDoctor';
import FarmJournal from './views/FarmJournal';
import VehicleMarket from './views/VehicleMarket';
import { Mic, X, Loader2, Trophy, Medal, Star, LogIn, LogOut } from 'lucide-react';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';

type Tab = 'home' | 'crops' | 'health' | 'village' | 'community' | 'news';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [subView, setSubView] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestPoints, setGuestPoints] = useState(0);

  // Gamification State
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoadingUser(false);
      if (u) {
        setIsGuest(false);
        // Fetch or create user profile
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const initialData = {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            points: 0,
            badges: [],
            lastActive: new Date().toISOString()
          };
          await setDoc(userRef, initialData);
          setPoints(0);
          setBadges([]);
        } else {
          // Real-time sync for points/badges
          const unsubProfile = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setPoints(data.points || 0);
              setBadges(data.badges || []);
            }
          });
          return () => unsubProfile();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Weather state
  const [weather, setWeather] = useState<{ temp: number, city: string, cond: string } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const getWeatherDesc = (code: number) => {
      if (code === 0) return 'Clear';
      if (code < 4) return 'Partly Cloudy';
      if (code < 70) return 'Rainy';
      return 'Cloudy';
    };

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        
        let city = 'Haveri, Karnataka';
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const geoData = await geoRes.json();
          city = geoData.address.village || geoData.address.town || geoData.address.city || geoData.address.district || 'Current Location';
        } catch (e) {
          console.error("Geo error", e);
        }

        setWeather({
          temp: Math.round(data.current_weather.temperature),
          city: city,
          cond: getWeatherDesc(data.current_weather.weathercode)
        });
      } catch (err) {
        setWeather({ temp: 32, city: 'Haveri, Karnataka', cond: 'Sunny' });
      } finally {
        setWeatherLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          setWeather({ temp: 32, city: 'Haveri, Karnataka', cond: 'Sunny' });
          setWeatherLoading(false);
        }
      );
    } else {
      setWeather({ temp: 32, city: 'Haveri, Karnataka', cond: 'Sunny' });
      setWeatherLoading(false);
    }
  }, []);

  const awardPoints = async (amount: number, reason: string) => {
    if (isGuest) {
      setGuestPoints(prev => prev + amount);
      return;
    }
    if (!user) return;
    const newPoints = points + amount;
    
    // Check for badges
    let newBadges = [...badges];
    if (newPoints >= 100 && !newBadges.includes('Disease Expert')) {
      newBadges.push('Disease Expert');
    }
    if (newPoints >= 50 && !newBadges.includes('Trusted Farmer')) {
      newBadges.push('Trusted Farmer');
    }
    if (newPoints > 0 && !newBadges.includes('First Harvest')) {
      newBadges.push('First Harvest');
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      points: newPoints,
      badges: newBadges,
      lastActive: new Date().toISOString()
    });
  };

  const handleVoiceTrigger = async () => {
    try {
      setIsListening(true);
      setAiResponse('');
      setVoiceText('Listening...');
      
      const text = await voiceService.listen();
      setVoiceText(text);
      setIsListening(false);
      setIsProcessing(true);

      const prompt = `You are Kisaan Sahayak AI. A farmer just said: "${text}". 
      Respond in short, simple 1-2 sentences. 
      If they asked about crops, guide them to the Crop Doctor tab. 
      If they asked about health, guide them to Health Assistant.
      Always be very polite and professional.`;

      const response = await generateResponse(prompt);
      setAiResponse(response || 'Sorry, I could not understand.');
      voiceService.speak(response || 'Sorry, I could not understand.');
    } catch (err) {
      console.error(err);
      setIsListening(false);
      setVoiceText('Error listening. Tap to try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSubView(null);
  };

  const renderContent = () => {
    if (subView === 'crop-history') {
      return <SavedRecords onBack={() => setSubView(null)} />;
    }
    if (subView === 'health-history') {
      return <HealthHistory onBack={() => setSubView(null)} />;
    }
    if (subView === 'field-locator') {
      return <FieldLocator onBack={() => setSubView(null)} />;
    }
    if (subView === 'mandi-prices') {
      return <MandiPrices onBack={() => setSubView(null)} />;
    }
    if (subView === 'weather-detail') {
      return <WeatherDetail onBack={() => setSubView(null)} city={weather?.city || 'Your Location'} />;
    }
    if (subView === 'knowledge-hub') {
      return <KnowledgeHub onBack={() => setSubView(null)} />;
    }
    if (subView === 'livestock-doctor') {
      return <LivestockDoctor onBack={() => setSubView(null)} onAwardPoints={(pts) => awardPoints(pts, 'Livestock Care')} />;
    }
    if (subView === 'farm-journal') {
      return <FarmJournal onBack={() => setSubView(null)} />;
    }
    if (subView === 'vehicle-market') {
      return <VehicleMarket onBack={() => setSubView(null)} />;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + (subView ? `-${subView}` : '')}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[calc(100vh-100px)]"
        >
          {(() => {
            switch (activeTab) {
              case 'home':
                return (
                  <Home 
                    onModuleSelect={(m) => {
                      const subViews = ['field-locator', 'mandi-prices', 'weather-detail', 'knowledge-hub', 'livestock-doctor', 'farm-journal', 'vehicle-market'];
                      if (subViews.includes(m)) setSubView(m);
                      else handleTabChange(m as Tab);
                    }} 
                    points={isGuest ? guestPoints : points} 
                    badges={isGuest ? [] : badges} 
                    weather={weather}
                    weatherLoading={weatherLoading}
                  />
                );
              case 'community':
                return <Community />;
              case 'crops':
                return <CropDoctor onAwardPoints={(pts) => awardPoints(pts, 'Crop Diagnosis')} onViewHistory={() => setSubView('crop-history')} />;
              case 'health':
                return <HealthHelper onAwardPoints={(pts) => awardPoints(pts, 'Health Check')} onViewHistory={() => setSubView('health-history')} />;
              case 'village':
                return <VillageHelp />;
              case 'news':
                return <NewsSection onBack={() => handleTabChange('home')} location={weather?.city} />;
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  const getPageTitle = () => {
    if (subView === 'crop-history') return 'Crop History';
    if (subView === 'health-history') return 'Health History';
    if (subView === 'field-locator') return 'Maps';
    if (subView === 'mandi-prices') return 'Mandi Prices';
    if (subView === 'weather-detail') return 'Weather';
    if (subView === 'knowledge-hub') return 'Knowledge';
    if (subView === 'livestock-doctor') return 'Livestock Doctor';
    if (subView === 'farm-journal') return 'My Journal';
    if (subView === 'vehicle-market') return 'Buy Vehicles';
    if (activeTab === 'news') return 'Rural News';
    switch (activeTab) {
      case 'home': return 'Kisaan Sahayak';
      case 'crops': return 'Crop Doctor';
      case 'health': return 'Health Assistant';
      case 'village': return 'Village Help';
      case 'community': return 'Village Talk';
      default: return 'Kisaan Sahayak';
    }
  };

  if (loadingUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-12 h-12 text-brand-green animate-spin" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-brand-bg p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/paddy.png')]">
        <div className="bg-white p-12 rounded-[48px] shadow-2xl border-b-8 border-brand-green max-w-md w-full space-y-8">
          <div className="w-24 h-24 bg-brand-green rounded-[32px] flex items-center justify-center text-white mx-auto shadow-xl">
            <Trophy className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-brand-dark tracking-tight leading-none uppercase">Kisaan Sahayak</h1>
            <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Village Smart Assistant</p>
          </div>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            Welcome to the village digital helper. Join your fellow farmers to get AI advice, share knowledge, and earn rewards!
          </p>
          <div className="space-y-4">
            <button 
              onClick={signInWithGoogle}
              className="w-full py-5 bg-brand-blue text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-[0_8px_0_#1E3A8A] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <LogIn className="w-6 h-6" />
              Login with Google
            </button>
            <button 
              onClick={() => setIsGuest(true)}
              className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-brand-blue transition-colors"
            >
              Explore as Guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleHistoryClick = () => {
    if (activeTab === 'crops') setSubView('crop-history');
    else if (activeTab === 'health') setSubView('health-history');
    else setSubView('crop-history');
  };

  return (
    <div className="relative">
      <Layout 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onVoiceClick={handleVoiceTrigger}
        onHistoryClick={handleHistoryClick}
        title={getPageTitle()}
        showBack={activeTab !== 'home' || !!subView}
        onBack={subView ? () => setSubView(null) : () => setActiveTab('home')}
      >
        {renderContent()}
      </Layout>

      {/* Voice Assistant Overlay */}
      <AnimatePresence>
        {(isListening || voiceText || isProcessing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-white text-center"
          >
            <button 
              id="close-voice"
              onClick={() => {
                setVoiceText('');
                setAiResponse('');
                setIsProcessing(false);
                setIsListening(false);
                voiceService.stop();
              }}
              className="absolute top-8 right-8 p-4 bg-white/10 rounded-full hover:bg-white/20 active:scale-90 transition-all border border-white/10"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="mb-16">
              <div className="relative">
                {isListening && (
                  <motion.div 
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute -inset-8 bg-brand-orange rounded-full blur-2xl"
                  />
                )}
                <div className="relative bg-brand-orange text-white p-12 rounded-full shadow-[0_12px_40px_rgba(255,159,28,0.4)] border-4 border-white/20">
                  {isProcessing ? (
                    <Loader2 className="w-16 h-16 animate-spin" />
                  ) : (
                    <Mic className="w-16 h-16" />
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-md space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-brand-orange">
                {isListening ? 'Kisaan Sahayak is listening' : 'Thinking...'}
              </h2>
              <p className="text-3xl font-black tracking-tight leading-tight">
                "{voiceText || 'How can I help you?'}"
              </p>
              
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 p-8 bg-white/10 rounded-[32px] border border-white/10 backdrop-blur-md shadow-2xl"
                >
                  <p className="text-xl leading-relaxed font-bold italic text-brand-orange">Kisaan Sahayak says:</p>
                  <p className="text-xl leading-relaxed mt-2">{aiResponse}</p>
                </motion.div>
              )}
            </div>

            {!isListening && !isProcessing && !aiResponse && (
              <button 
                onClick={handleVoiceTrigger}
                className="mt-16 px-10 py-5 bg-brand-orange text-white rounded-2xl font-black shadow-[0_8px_0_#E08500] active:translate-y-1 active:shadow-none transition-all uppercase tracking-[0.2em] text-sm"
              >
                Tap to Speak Again
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
