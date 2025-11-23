import React from 'react';

const AnimatedBackground = () => {
    // Strategically positioned grade letters for even distribution
    const gradeElements = [
        // Top row
        { grade: 'A+', left: '8%', top: '12%', delay: '0s', duration: '14s', size: '3rem', opacity: 0.12 },
        { grade: '10', left: '25%', top: '8%', delay: '2s', duration: '16s', size: '2.8rem', opacity: 0.15 },
        { grade: 'O', left: '45%', top: '15%', delay: '1s', duration: '13s', size: '3.2rem', opacity: 0.1 },
        { grade: '9.5', left: '68%', top: '10%', delay: '3s', duration: '15s', size: '2.5rem', opacity: 0.18 },
        { grade: 'S', left: '88%', top: '18%', delay: '1.5s', duration: '17s', size: '3rem', opacity: 0.13 },

        // Middle-upper row
        { grade: 'A', left: '15%', top: '35%', delay: '2.5s', duration: '12s', size: '2.8rem', opacity: 0.16 },
        { grade: '95%', left: '35%', top: '32%', delay: '0.5s', duration: '18s', size: '2.6rem', opacity: 0.14 },
        { grade: 'B+', left: '55%', top: '38%', delay: '3.5s', duration: '14s', size: '2.9rem', opacity: 0.11 },
        { grade: '8.7', left: '78%', top: '33%', delay: '1.8s', duration: '16s', size: '2.7rem', opacity: 0.17 },

        // Middle row
        { grade: 'E', left: '5%', top: '55%', delay: '3s', duration: '15s', size: '3.1rem', opacity: 0.12 },
        { grade: '9.0', left: '28%', top: '58%', delay: '0.8s', duration: '13s', size: '2.6rem', opacity: 0.19 },
        { grade: 'A-', left: '50%', top: '52%', delay: '2.2s', duration: '17s', size: '2.8rem', opacity: 0.13 },
        { grade: '88%', left: '72%', top: '57%', delay: '1.2s', duration: '14s', size: '2.5rem', opacity: 0.15 },
        { grade: 'B', left: '92%', top: '53%', delay: '3.8s', duration: '16s', size: '3rem', opacity: 0.11 },

        // Bottom row
        { grade: '8.0', left: '12%', top: '78%', delay: '1.5s', duration: '15s', size: '2.7rem', opacity: 0.16 },
        { grade: 'C+', left: '32%', top: '82%', delay: '2.8s', duration: '12s', size: '2.9rem', opacity: 0.12 },
        { grade: '10', left: '52%', top: '75%', delay: '0.3s', duration: '18s', size: '3.2rem', opacity: 0.14 },
        { grade: '75%', left: '73%', top: '80%', delay: '3.2s', duration: '14s', size: '2.6rem', opacity: 0.17 },
        { grade: 'A+', left: '90%', top: '77%', delay: '1.8s', duration: '16s', size: '3rem', opacity: 0.13 },
    ];

    // Strategically positioned gradient orbs for balanced coverage
    const orbs = [
        // Top-left quadrant
        { left: '15%', top: '25%', delay: '0s', duration: '14s', color: 'rgba(0, 243, 255, 0.12)', size: '500px' },

        // Top-right quadrant
        { left: '75%', top: '20%', delay: '2s', duration: '16s', color: 'rgba(168, 85, 247, 0.1)', size: '450px' },

        // Center
        { left: '50%', top: '50%', delay: '1s', duration: '18s', color: 'rgba(0, 243, 255, 0.08)', size: '600px' },

        // Bottom-left quadrant
        { left: '20%', top: '75%', delay: '3s', duration: '15s', color: 'rgba(34, 211, 238, 0.11)', size: '480px' },

        // Bottom-right quadrant
        { left: '80%', top: '70%', delay: '1.5s', duration: '17s', color: 'rgba(59, 130, 246, 0.09)', size: '520px' },

        // Additional accent orbs
        { left: '40%', top: '15%', delay: '2.5s', duration: '13s', color: 'rgba(168, 85, 247, 0.07)', size: '380px' },
        { left: '65%', top: '85%', delay: '0.8s', duration: '19s', color: 'rgba(0, 243, 255, 0.1)', size: '420px' },
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Floating Gradient Orbs */}
            {orbs.map((orb, index) => (
                <div
                    key={`orb-${index}`}
                    className="absolute rounded-full blur-[120px]"
                    style={{
                        left: orb.left,
                        top: orb.top,
                        width: orb.size,
                        height: orb.size,
                        backgroundColor: orb.color,
                        animation: `floatOrb ${orb.duration} ease-in-out infinite`,
                        animationDelay: orb.delay,
                        transform: 'translate(-50%, -50%)', // Center the orbs on their position
                    }}
                />
            ))}

            {/* Floating Grade Letters */}
            {gradeElements.map((item, index) => (
                <div
                    key={`grade-${index}`}
                    className="absolute font-bold"
                    style={{
                        left: item.left,
                        top: item.top,
                        fontSize: item.size,
                        color: `rgba(255, 255, 255, ${item.opacity})`,
                        animation: `floatGrade ${item.duration} ease-in-out infinite`,
                        animationDelay: item.delay,
                        transform: 'translate(-50%, -50%)', // Center the text on its position
                    }}
                >
                    {item.grade}
                </div>
            ))}

            {/* Inline keyframes */}
            <style>{`
                @keyframes floatOrb {
                    0%, 100% {
                        transform: translate(-50%, -50%) translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(-50%, -50%) translate(40px, -60px) scale(1.15);
                    }
                    66% {
                        transform: translate(-50%, -50%) translate(-35px, 50px) scale(0.9);
                    }
                }

                @keyframes floatGrade {
                    0%, 100% {
                        transform: translate(-50%, -50%) translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translate(-50%, -50%) translateY(-25px) rotate(6deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default AnimatedBackground;
