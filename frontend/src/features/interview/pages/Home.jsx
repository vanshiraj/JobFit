import React, { useState, useRef, useEffect } from 'react';
import "../style/home.scss";
import { useInterview } from '../hook/useinterview.js';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { loading, generatereport, reports, getallreports } = useInterview();
    const { user, handleLogout } = useAuth();
    const [ jobdescription, setJobdescription ] = useState("");
    const [ selfdescription, setSelfdescription ] = useState("");
    const [ title, setTitle ] = useState("");
    const [ fileName, setFileName ] = useState("");
    const [ error, setError ] = useState("");
    const resumeInputRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        getallreports().catch((err) => console.error("Error fetching reports:", err));
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setError("");
        }
    };

    const handleGenerateReport = async () => {
        setError("");
        const resume = resumeInputRef.current?.files?.[0];

        if (!title.trim()) {
            setError("Please provide an Interview Title.");
            return;
        }

        if (!jobdescription.trim()) {
            setError("Target Job Description is required.");
            return;
        }

        if (!resume) {
            setError("Please upload your Resume (PDF or DOCX).");
            return;
        }

        if (!selfdescription.trim()) {
            setError("Please provide a quick Self-Description.");
            return;
        }

        try {
            const data = await generatereport({
                jobdescription,
                selfdescription,
                resume,
                title
            });

            console.log("REPORT RESPONSE:", data);

            if (data?.interviewreport?._id) {
                navigate(`/interview/${data.interviewreport._id}`);
            }
        } catch (err) {
            console.error("Failed to generate report:", err);
            setError(err.response?.data?.message || err.message || "Failed to generate interview strategy. Please try again.");
        }
    };

    const onLogout = async () => {
        try {
            await handleLogout();
            navigate("/login");
        } catch (err) {
            console.error("Logout error:", err);
            navigate("/login");
        }
    };

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        );
    }

    return (
        <div className='home-page'>
            {/* Top Bar with user info and logout */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#888' }}>Logged in as:</span>
                    <strong style={{ color: '#fff', fontSize: '1rem' }}>{user?.name || user?.email || 'User'}</strong>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'transparent',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {error && (
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto 1.5rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(229, 62, 62, 0.15)',
                    border: '1px solid #e53e3e',
                    color: '#fc8181',
                    fontSize: '0.95rem',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobdescription}
                            onChange={(e) => { setJobdescription(e.target.value); setError(""); }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobdescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Interview Title */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='title'>
                                Interview Title
                                <span className='badge badge--required'>Required</span>
                            </label>

                            <input
                                type='text'
                                id='title'
                                name='title'
                                className='panel__input'
                                placeholder='e.g. Full Stack Developer Intern'
                                value={title}
                                onChange={(e) => { setTitle(e.target.value); setError(""); }}
                                maxLength={100}
                            />
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--required'>Required</span>
                            </label>
                            <label className='dropzone' htmlFor='resume'>
                                <span className='dropzone__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                </span>
                                <p className='dropzone__title'>
                                    {fileName ? `File: ${fileName}` : "Click to upload or drag & drop"}
                                </p>
                                <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='.pdf,.docx'
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* Divider */}
                        <div className='or-divider'><span>AND</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>
                                Quick Self-Description
                                <span className='badge badge--required'>Required</span>
                            </label>
                            <textarea
                                value={selfdescription}
                                onChange={(e) => { setSelfdescription(e.target.value); setError(""); }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Upload your <strong>Resume</strong> and provide a <strong>Job Description</strong> to generate your custom interview plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports && reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    );
};

export default Home;