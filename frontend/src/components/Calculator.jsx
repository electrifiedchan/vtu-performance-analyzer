import React, { useState } from 'react';
import SpotlightCard from './ui/SpotlightCard';
import MagneticButton from './ui/MagneticButton';
import { Plus, Trash2, Calculator as CalcIcon, RefreshCcw } from 'lucide-react';

const GRADE_POINTS = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0,
};

const Calculator = () => {
    const [courses, setCourses] = useState([
        { id: 1, name: '', credit: '', grade: 'O' }
    ]);
    const [sgpa, setSgpa] = useState(null);

    const addCourse = () => {
        setCourses([...courses, { id: Date.now(), name: '', credit: '', grade: 'O' }]);
    };

    const removeCourse = (id) => {
        if (courses.length > 1) {
            setCourses(courses.filter(course => course.id !== id));
        }
    };

    const updateCourse = (id, field, value) => {
        setCourses(courses.map(course =>
            course.id === id ? { ...course, [field]: value } : course
        ));
    };

    const calculateSGPA = () => {
        let totalCredits = 0;
        let totalPoints = 0;
        let isValid = true;

        courses.forEach(course => {
            const credit = parseFloat(course.credit);
            if (!course.credit || isNaN(credit)) {
                isValid = false;
            }
            totalCredits += credit;
            totalPoints += credit * GRADE_POINTS[course.grade];
        });

        if (!isValid) {
            alert("Please enter valid credits for all courses.");
            return;
        }

        if (totalCredits === 0) {
            setSgpa(0);
        } else {
            setSgpa((totalPoints / totalCredits).toFixed(2));
        }
    };

    const reset = () => {
        setCourses([{ id: Date.now(), name: '', credit: '', grade: 'O' }]);
        setSgpa(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            <SpotlightCard className="border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-light tracking-wider text-white">Course Details</h2>
                    <div className="text-xs text-white/40 font-mono">SEM_01 // BATCH_2025</div>
                </div>

                <div className="space-y-4">
                    {courses.map((course, index) => (
                        <div key={course.id} className="grid grid-cols-12 gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="col-span-1 text-white/20 font-mono text-sm">
                                {(index + 1).toString().padStart(2, '0')}
                            </div>
                            <div className="col-span-5">
                                <input
                                    type="text"
                                    placeholder="Subject Name"
                                    value={course.name}
                                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue transition-colors placeholder:text-white/20"
                                />
                            </div>
                            <div className="col-span-2">
                                <input
                                    type="number"
                                    placeholder="Credit"
                                    value={course.credit}
                                    onChange={(e) => updateCourse(course.id, 'credit', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue transition-colors placeholder:text-white/20"
                                />
                            </div>
                            <div className="col-span-3">
                                <select
                                    value={course.grade}
                                    onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue transition-colors appearance-none cursor-pointer"
                                >
                                    {Object.keys(GRADE_POINTS).map(g => (
                                        <option key={g} value={g} className="bg-black text-white">{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <button
                                    onClick={() => removeCourse(course.id)}
                                    className="text-white/20 hover:text-red-500 transition-colors"
                                    disabled={courses.length === 1}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex gap-4">
                    <MagneticButton
                        onClick={addCourse}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-white transition-colors"
                    >
                        <Plus size={16} /> Add Course
                    </MagneticButton>
                </div>
            </SpotlightCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SpotlightCard className="flex flex-col justify-center items-center text-center space-y-4">
                    <div className="text-white/40 text-sm font-mono tracking-widest">CALCULATED SGPA</div>
                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 font-mono">
                        {sgpa !== null ? sgpa : "0.00"}
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-electric-blue to-transparent opacity-50"></div>
                </SpotlightCard>

                <SpotlightCard className="flex flex-col justify-center gap-4">
                    <MagneticButton
                        onClick={calculateSGPA}
                        className="w-full py-4 bg-electric-blue text-black font-bold rounded hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <CalcIcon size={20} /> CALCULATE
                    </MagneticButton>
                    <MagneticButton
                        onClick={reset}
                        className="w-full py-4 bg-transparent border border-white/20 text-white rounded hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={20} /> RESET
                    </MagneticButton>
                </SpotlightCard>
            </div>
        </div>
    );
};

export default Calculator;
