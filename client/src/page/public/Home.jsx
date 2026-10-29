import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { fetchBio } from '../../Redux/bioSlice';
import { fetchExperiences } from '../../Redux/experienceSlice';
import { fetchProjects } from '../../Redux/projectSlice';
import { fetchSkills } from '../../Redux/skillSlice';
import API, { getErrorMessage } from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

import profileImage from '../../assets/profile.jpg';

// Resize and compress Cloudinary images automatically
const optimizeImage = (url) =>
    url && url.includes('/upload/') ? url.replace('/upload/', '/upload/f_auto,q_auto,w_800/') : url;

// Custom Hook for Scroll Animation
const useOnScreen = (options) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        if (node) observer.observe(node);
        return () => {
            if (node) observer.unobserve(node);
        };
    }, [options]);

    return [ref, isVisible];
};

const observerOptions = { threshold: 0.1 };

const AnimatedSection = ({ children, className = '' }) => {
    const [ref, isVisible] = useOnScreen(observerOptions);
    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 transform motion-reduce:transition-none ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${className}`}
        >
            {children}
        </div>
    );
};

const Home = () => {
    const dispatch = useDispatch();

    const bioState = useSelector((state) => state.bio);
    const bioLoading = useSelector((state) => state.bio?.loading);
    const rawBio = bioState?.bio || bioState;
    const bio = Array.isArray(rawBio) ? rawBio[0] || {} : (rawBio || {});

    const { experiences } = useSelector((state) => state.experiences || { experiences: [] });
    const { projects } = useSelector((state) => state.projects || { projects: [] });
    const { skills } = useSelector((state) => state.skills || { skills: [] });

    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Typewriter text comes from the Bio headline
    const [typedText, setTypedText] = useState('');
    const fullTitle = bio?.headline || '';

    useEffect(() => {
        dispatch(fetchBio());
        dispatch(fetchExperiences());
        dispatch(fetchProjects());
        dispatch(fetchSkills());
    }, [dispatch]);

    useEffect(() => {
        setTypedText('');
        if (!fullTitle) return;
        let index = 0;
        const timer = setInterval(() => {
            index++;
            setTypedText(fullTitle.slice(0, index));
            if (index >= fullTitle.length) clearInterval(timer);
        }, 80);
        return () => clearInterval(timer);
    }, [fullTitle]);

    // Group skills by category
    const groupedSkills = useMemo(() => {
        return (skills || []).reduce((acc, skill) => {
            const key = skill.category || 'Other';
            (acc[key] = acc[key] || []).push(skill);
            return acc;
        }, {});
    }, [skills]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await API.post('/messages/message', formData);
            setSuccessMessage('Thank you! Your message has been sent successfully.');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setErrorMessage(getErrorMessage(error) || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (bioLoading) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const hasLinkedin = bio?.linkedin && bio.linkedin !== '...........';

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">

            <style>{`
                @keyframes morphBlob {
                    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                }
                .animate-blob-morph { animation: morphBlob 8s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .animate-blob-morph { animation: none; }
                }
            `}</style>

            <Navbar bio={bio} />

            {/* Hero Section */}
            <header className="relative overflow-hidden py-16 lg:py-28 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[80vh]">

                <div className="lg:col-span-7 flex flex-col items-start text-left z-10 space-y-6">

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-wide uppercase shadow-lg shadow-orange-500/5">
                        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                        Welcome to my portfolio
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
                        Hi, <br />
                        I'm <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">{bio?.name || 'there'}</span> <br />

                        <span className="text-slate-300 text-2xl sm:text-4xl font-bold mt-3 block tracking-wide min-h-[1.5em]">
                            {typedText}
                            <span className="animate-pulse text-orange-400 font-light ml-1">|</span>
                        </span>
                    </h1>

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                        <a
                            href="#contact"
                            className="inline-block px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold shadow-lg shadow-orange-600/30 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-orange-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f19]"
                        >
                            Contact me
                        </a>
                        {bio?.resumeUrl && (
                            <a
                                href={bio.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3.5 rounded-xl border border-orange-500/50 text-orange-400 font-semibold hover:bg-orange-500/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                            >
                                Download CV
                            </a>
                        )}
                    </div>

                    {/* Social Media Links */}
                    <div className="flex items-center gap-6 pt-4 text-slate-400">
                        {hasLinkedin && (
                            <a href={bio.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-all duration-300 text-lg flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded">
                                <FontAwesomeIcon icon={faLinkedinIn} className="text-orange-500" /> LinkedIn
                            </a>
                        )}
                        {bio?.github && (
                            <a href={bio.github} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-all duration-300 text-lg flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded">
                                <FontAwesomeIcon icon={faGithub} className="text-orange-500" /> GitHub
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Side: Blob Image */}
                <div className="lg:col-span-5 flex justify-center z-10">
                    <div className="relative w-72 sm:w-80 lg:w-96 h-72 sm:h-80 lg:h-96 flex items-center justify-center group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/40 via-amber-500/30 to-orange-600/30 animate-blob-morph filter blur-xl opacity-75"></div>
                        <div className="relative w-64 sm:w-72 lg:w-84 h-64 sm:h-72 lg:h-84 overflow-hidden shadow-2xl bg-slate-900 border-2 border-orange-500/60 animate-blob-morph transition-transform duration-500 group-hover:scale-105">
                            <img
                                src={profileImage}
                                alt={bio?.name || 'Profile'}
                                className="w-full h-full object-cover object-top transform scale-110 transition-transform duration-700 group-hover:scale-125"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* About Section */}
            <AnimatedSection>
                <section id="about" className="py-20 px-6 sm:px-12 lg:px-24 max-w-4xl mx-auto">
                    <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:border-orange-500/40 hover:-translate-y-1">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                            About Me
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                            {bio?.aboutText || 'Passionate developer dedicated to writing clean code and building scalable applications.'}
                        </p>
                    </div>
                </section>
            </AnimatedSection>

            {/* Experience Section */}
            {experiences && experiences.length > 0 && (
                <AnimatedSection>
                    <section id="experience" className="py-20 px-6 sm:px-12 lg:px-24 max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Work Experience</h2>
                            <p className="text-slate-400 text-sm sm:text-base">My professional career journey</p>
                        </div>
                        <div className="space-y-6">
                            {experiences.map((exp, index) => (
                                <div
                                    key={exp._id || exp.id || index}
                                    className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-[2rem] shadow-2xl transition-all duration-500 hover:border-orange-500/50 hover:-translate-y-1"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{exp.jobTitle}</h3>
                                            <p className="text-orange-400 font-semibold text-sm mt-1">{exp.company}</p>
                                        </div>
                                        {exp.startDate && (
                                            <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium w-fit">
                                                {exp.startDate} - {exp.current ? 'Present' : (exp.endDate || 'Present')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </AnimatedSection>
            )}

            {/* Projects Section */}
            {projects && projects.length > 0 && (
                <AnimatedSection>
                    <section id="works" className="py-20 px-6 sm:px-12 lg:px-24 max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Works / Projects</h2>
                            <p className="text-slate-400 text-sm sm:text-base">A selection of things I've built recently</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[...projects].reverse().map((project) => (
                                <div
                                    key={project._id || project.id}
                                    className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 hover:border-orange-500/50 hover:-translate-y-2 flex flex-col group"
                                >
                                    <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                                        {project.imageUrl || project.image ? (
                                            <img
                                                src={optimizeImage(project.imageUrl || project.image)}
                                                alt={project.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-950/30 to-slate-900 text-orange-400 font-bold text-xl">
                                                {project.title}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 flex flex-col flex-grow justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{project.title}</h3>
                                            <p className="text-slate-300 text-sm mb-4 leading-relaxed line-clamp-3">{project.description}</p>
                                            {project.technology?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-6">
                                                    {project.technology.map((tech, i) => (
                                                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {(project.liveUrl || project.githubUrl) && (
                                            <div className="flex items-center gap-4 pt-4 border-t border-slate-800/80">
                                                {project.liveUrl && (
                                                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                                                        Live Demo &rarr;
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                                                        GitHub Repository
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </AnimatedSection>
            )}

            {/* Skills Section (grouped by category) */}
            {skills && skills.length > 0 && (
                <AnimatedSection>
                    <section id="skills" className="py-20 px-6 sm:px-12 lg:px-24 max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Technical Skills</h2>
                            <p className="text-slate-400 text-sm sm:text-base">Technologies and tools I work with</p>
                        </div>

                        <div className="space-y-12">
                            {Object.entries(groupedSkills).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-lg font-bold text-orange-400 mb-5 border-b border-slate-800 pb-2">{category}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {items.map((skill, index) => {
                                            const proficiency = skill.proficiency ?? 85;
                                            return (
                                                <div key={skill._id || index} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-[2rem] shadow-xl transition-all duration-300 hover:border-orange-500/50 hover:-translate-y-1.5 group">
                                                    <div className="flex items-center gap-4 mb-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0 group-hover:bg-orange-500/20 transition-all">
                                                            {skill.name ? skill.name.charAt(0).toUpperCase() : 'S'}
                                                        </div>
                                                        <h4 className="text-lg font-bold text-white">{skill.name}</h4>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-semibold text-slate-400 tracking-wider">PROFICIENCY</span>
                                                        <span className="text-sm font-bold text-orange-400">{proficiency}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                                                        <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${proficiency}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </AnimatedSection>
            )}

            {/* Contact Section */}
            <AnimatedSection>
                <section id="contact" className="py-24 px-6 sm:px-12 lg:px-24 max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Let's Build Something Together</h2>
                        <p className="text-slate-400 text-sm sm:text-base">Have a question or want to work together? Drop me a message.</p>
                    </div>

                    <form onSubmit={handleContactSubmit} className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl space-y-6">
                        {successMessage && (
                            <div role="status" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
                                {successMessage}
                            </div>
                        )}
                        {errorMessage && (
                            <div role="alert" className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
                                {errorMessage}
                            </div>
                        )}

                        <div>
                            <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Name</label>
                            <input id="contact-name" type="text" name="name" maxLength={100} value={formData.name} onChange={handleChange} required className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-orange-500 transition-all" placeholder="John Doe" />
                        </div>

                        <div>
                            <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Email</label>
                            <input id="contact-email" type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-orange-500 transition-all" placeholder="john@example.com" />
                        </div>

                        <div>
                            <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Message</label>
                            <textarea id="contact-message" name="message" rows="4" maxLength={2000} value={formData.message} onChange={handleChange} required className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-orange-500 transition-all resize-none" placeholder="Write your message here..." />
                        </div>

                        <button type="submit" disabled={submitting} className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-semibold shadow-xl shadow-orange-600/30 transition-all disabled:opacity-50">
                            {submitting ? 'Sending...' : 'Send message'}
                        </button>
                    </form>
                </section>
            </AnimatedSection>

            <Footer bio={bio} />
        </div>
    );
};

export default Home;
