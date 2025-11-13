import type {
    ProcessedStudentData,
    CourseGrade,
    StudentInfoStatistics,
    SemesterSummaryByMajor,
    FinalExamStatistics,
    GradeMajorAnalysis,
    TeachingPerformanceAnalysis,
    CourseStatistics,
    ScoreDistribution
} from '@/types';

export class DataAnalyzer {
    /**
     * 学生信息统计
     */
    analyzeStudentInfo(data: ProcessedStudentData[]): StudentInfoStatistics {
        const byMajor: { [major: string]: number } = {};
        const byGrade: { [grade: string]: number } = {};
        const byGender: { [gender: string]: number } = {};
        const byStudentType: { [type: string]: number } = {};

        data.forEach(student => {
            // 按专业统计
            const major = student.major || '未知专业';
            byMajor[major] = (byMajor[major] || 0) + 1;

            // 按年级统计
            const grade = student.grade || '未知年级';
            byGrade[grade] = (byGrade[grade] || 0) + 1;

            // 按性别统计
            const gender = student.gender || '未知性别';
            byGender[gender] = (byGender[gender] || 0) + 1;

            // 按学生类别统计（这里需要从原始数据获取，暂时用专业代替）
            byStudentType[major] = (byStudentType[major] || 0) + 1;
        });

        return {
            totalStudents: data.length,
            byMajor,
            byGrade,
            byGender,
            byStudentType
        };
    }

    /**
     * 学期成绩汇总表（按专业）
     */
    analyzeSemesterSummary(data: ProcessedStudentData[]): SemesterSummaryByMajor[] {
        const majorMap = new Map<string, ProcessedStudentData[]>();

        // 按专业分组
        data.forEach(student => {
            const major = student.major || '未知专业';
            if (!majorMap.has(major)) {
                majorMap.set(major, []);
            }
            majorMap.get(major)!.push(student);
        });

        const results: SemesterSummaryByMajor[] = [];

        majorMap.forEach((students, major) => {
            const allCourses = students.flatMap(s => s.courses);
            const validCourses = allCourses.filter(c => !c.isVoid);

            // 人数（去重）：按学号或姓名去重
            const uniqueStudentIds = new Set<string>();
            students.forEach(s => {
                if (s.studentId) uniqueStudentIds.add(s.studentId);
                else uniqueStudentIds.add(`${s.studentName}-${s.className}`);
            });
            const uniqueStudentCount = uniqueStudentIds.size;

            // 人次：参加考试的次数（所有有效课程条目数）
            const totalExamCount = validCourses.length;

            const totalCredits = validCourses.reduce((sum, course) => sum + (course.credit || 0), 0);
            const totalGradePoints = validCourses.reduce((sum, course) => sum + (course.gpa || 0) * (course.credit || 0), 0);
            const averageGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

            const passedCourses = validCourses.filter(c => c.isPassed);
            const excellentCourses = validCourses.filter(c => (c.normalizedScore || 0) >= 90);
            const failedCourses = validCourses.filter(c => !c.isPassed);

            // 优秀/不及格人数（去重）与人次（次数）
            const excellentStudentIds = new Set<string>();
            const failedStudentIds = new Set<string>();
            students.forEach(s => {
                // 是否该学生有优秀的有效课程
                const hasExcellent = s.courses.some(c => !c.isVoid && (c.normalizedScore || 0) >= 90);
                const hasFailed = s.courses.some(c => !c.isVoid && !c.isPassed);
                const id = s.studentId || `${s.studentName}-${s.className}`;
                if (hasExcellent) excellentStudentIds.add(id);
                if (hasFailed) failedStudentIds.add(id);
            });
            const excellentStudentCount = excellentStudentIds.size;
            const failedStudentCount = failedStudentIds.size;
            const excellentExamCount = excellentCourses.length;
            const failedExamCount = failedCourses.length;

            const passRate = validCourses.length > 0 ? (passedCourses.length / validCourses.length) * 100 : 0;
            const excellentRate = validCourses.length > 0 ? (excellentCourses.length / validCourses.length) * 100 : 0;
            const failureRate = validCourses.length > 0 ? (failedCourses.length / validCourses.length) * 100 : 0;

            results.push({
                major,
                totalStudents: students.length,
                uniqueStudentCount,
                totalExamCount,
                excellentStudentCount,
                excellentExamCount,
                failedStudentCount,
                failedExamCount,
                averageGPA: Math.round(averageGPA * 100) / 100,
                passRate: Math.round(passRate * 10) / 10,
                excellentRate: Math.round(excellentRate * 10) / 10,
                failureRate: Math.round(failureRate * 10) / 10,
                totalCredits: Math.round((totalCredits / students.length) * 10) / 10 // 平均学分
            });
        });

        return results.sort((a, b) => a.major.localeCompare(b.major));
    }

    /**
     * 各专业期末成绩表
     */
    analyzeFinalExamsByMajor(data: ProcessedStudentData[]): FinalExamStatistics[] {
        const majorMap = new Map<string, ProcessedStudentData[]>();

        // 按专业分组
        data.forEach(student => {
            if (!majorMap.has(student.major)) {
                majorMap.set(student.major, []);
            }
            majorMap.get(student.major)!.push(student);
        });

        const results: FinalExamStatistics[] = [];

        majorMap.forEach((students, major) => {
            const allCourses = students.flatMap(s => s.courses);
            const finalExamCourses = allCourses.filter(c =>
                c.status === '期末考试' || c.status === '期末' || !c.isVoid
            );

            // 按课程分组统计
            const courseMap = new Map<string, CourseGrade[]>();
            finalExamCourses.forEach(course => {
                const key = `${course.courseName}-${course.teacher}`;
                if (!courseMap.has(key)) {
                    courseMap.set(key, []);
                }
                courseMap.get(key)!.push(course);
            });

            const courseStats: CourseStatistics[] = [];
            courseMap.forEach((courses, key) => {
                const [courseName, teacher] = key.split('-');
                const stats = this.calculateCourseStatistics(courseName, teacher, courses);
                courseStats.push(stats);
            });

            // 计算专业整体表现
            const allScores = finalExamCourses.map(c => c.normalizedScore);
            const averageScore = allScores.length > 0 ?
                allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0;

            const passedCount = finalExamCourses.filter(c => c.isPassed).length;
            const excellentCount = finalExamCourses.filter(c => c.normalizedScore >= 90).length;

            const passRate = finalExamCourses.length > 0 ? (passedCount / finalExamCourses.length) * 100 : 0;
            const excellentRate = finalExamCourses.length > 0 ? (excellentCount / finalExamCourses.length) * 100 : 0;

            results.push({
                major,
                courses: courseStats,
                overallPerformance: {
                    averageScore,
                    passRate,
                    excellentRate
                }
            });
        });

        return results.sort((a, b) => a.major.localeCompare(b.major));
    }

    /**
     * 各级各专业成绩分析表
     */
    analyzeByGradeAndMajor(data: ProcessedStudentData[]): GradeMajorAnalysis[] {
        const gradeMap = new Map<string, Map<string, ProcessedStudentData[]>>();

        // 按年级和专业分组
        data.forEach(student => {
            if (!gradeMap.has(student.grade)) {
                gradeMap.set(student.grade, new Map());
            }
            const majorMap = gradeMap.get(student.grade)!;
            if (!majorMap.has(student.major)) {
                majorMap.set(student.major, []);
            }
            majorMap.get(student.major)!.push(student);
        });

        const results: GradeMajorAnalysis[] = [];

        gradeMap.forEach((majorMap, grade) => {
            majorMap.forEach((students, major) => {
                const allCourses = students.flatMap(s => s.courses.filter(c => !c.isVoid));

                if (allCourses.length === 0) return;

                const scores = allCourses.map(c => c.normalizedScore);
                const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

                const passedCount = allCourses.filter(c => c.isPassed).length;
                const excellentCount = allCourses.filter(c => c.normalizedScore > 90).length;
                const failedCount = allCourses.filter(c => !c.isPassed).length;

                const passRate = (passedCount / allCourses.length) * 100;
                const excellentRate = (excellentCount / allCourses.length) * 100;
                const failureRate = (failedCount / allCourses.length) * 100;

                // 计算平均GPA（加权平均）
                const totalCredits = allCourses.reduce((sum, course) => sum + (course.credit || 0), 0);
                const totalGradePoints = allCourses.reduce((sum, course) => sum + (course.gpa || 0) * (course.credit || 0), 0);
                const averageGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

                // 找出表现最好和最差的课程
                // 注意：下方的“优势/薄弱课程”列表中将排除通识类课程与“军事理论”课程。
                // 如需调整排除规则，请修改 shouldExcludeFromTopWeak() 逻辑。
                const shouldExcludeFromTopWeak = (courseName: string): boolean => {
                    const name = (courseName || '').toLowerCase();
                    // 规则：
                    // 1) 课程名包含“通识”
                    // 2) 课程名包含“军事理论”
                    // 如果你需要排除更多关键词，可在此处追加条件
                    return name.includes('通识') || name.includes('军事理论');
                };
                const coursePerformance = new Map<string, number[]>();
                allCourses.forEach(course => {
                    if (!coursePerformance.has(course.courseName)) {
                        coursePerformance.set(course.courseName, []);
                    }
                    coursePerformance.get(course.courseName)!.push(course.normalizedScore);
                });

                const courseAverages = Array.from(coursePerformance.entries()).map(([name, scores]) => ({
                    name,
                    average: scores.reduce((sum, score) => sum + score, 0) / scores.length
                }));

                // 排序前先过滤掉需要排除的课程（通识、军事理论）
                const filteredAverages = courseAverages.filter(c => !shouldExcludeFromTopWeak(c.name));
                filteredAverages.sort((a, b) => b.average - a.average);

                // 生成“优势课程”（均值最高的前3门）与“薄弱课程”（均值最低的后3门）
                const topCourses = filteredAverages.slice(0, 3).map(c => c.name);
                const weakCourses = filteredAverages.slice(-3).map(c => c.name);

                results.push({
                    grade,
                    major,
                    studentCount: students.length,
                    averageScore,
                    passRate,
                    excellentRate,
                    failureRate,
                    topCourses,
                    weakCourses,
                    averageGPA: Math.round(averageGPA * 100) / 100
                });
            });
        });

        return results.sort((a, b) => {
            const gradeCompare = a.grade.localeCompare(b.grade);
            return gradeCompare !== 0 ? gradeCompare : a.major.localeCompare(b.major);
        });
    }

    /**
     * 不同老师教学情况分析表
     */
    analyzeTeachingPerformance(data: ProcessedStudentData[]): TeachingPerformanceAnalysis[] {
        const teacherMap = new Map<string, CourseGrade[]>();

        // 按老师分组
        data.forEach(student => {
            student.courses.forEach(course => {
                if (!course.isVoid) {
                    const teacherName = (typeof course.teacher === 'string' && course.teacher.trim().length > 0)
                        ? course.teacher.trim()
                        : '未知教师';
                    if (!teacherMap.has(teacherName)) {
                        teacherMap.set(teacherName, []);
                    }
                    teacherMap.get(teacherName)!.push(course);
                }
            });
        });

        const results: TeachingPerformanceAnalysis[] = [];

        teacherMap.forEach((courses, teacher) => {
            const uniqueCourses = [...new Set(courses.map(c => c.courseName || '未知课程'))];
            const scores = courses.map(c => c.normalizedScore).filter(s => typeof s === 'number' && !isNaN(s));
            const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

            const passedCount = courses.filter(c => c.isPassed).length;
            const excellentCount = courses.filter(c => (c.normalizedScore || 0) >= 90).length;

            const passRate = courses.length > 0 ? (passedCount / courses.length) * 100 : 0;
            const excellentRate = courses.length > 0 ? (excellentCount / courses.length) * 100 : 0;

            // 按课程分组比较
            const courseComparison = uniqueCourses.map(courseName => {
                const courseCourses = courses.filter(c => (c.courseName || '未知课程') === courseName);
                const courseScores = courseCourses.map(c => c.normalizedScore).filter(s => typeof s === 'number' && !isNaN(s));
                const courseAverage = courseScores.length > 0 ? courseScores.reduce((sum, score) => sum + score, 0) / courseScores.length : 0;
                const coursePassRate = courseCourses.length > 0 ? (courseCourses.filter(c => c.isPassed).length / courseCourses.length) * 100 : 0;

                return {
                    courseName,
                    averageScore: courseAverage,
                    passRate: coursePassRate,
                    studentCount: courseCourses.length
                };
            });

            results.push({
                teacher: teacher && teacher.length > 0 ? teacher : '未知教师',
                courses: uniqueCourses,
                totalStudents: courses.length,
                averageScore,
                passRate,
                excellentRate,
                courseComparison
            });
        });

        return results.sort((a, b) => (a.teacher || '未知教师').localeCompare(b.teacher || '未知教师'));
    }

    /**
     * 按课程分析
     */
    analyzeByCourse(data: ProcessedStudentData[]): CourseStatistics[] {
        const courseMap = new Map<string, CourseGrade[]>();

        // 按课程分组
        data.forEach(student => {
            student.courses.forEach(course => {
                if (!course.isVoid) {
                    const key = `${course.courseName}-${course.teacher}`;
                    if (!courseMap.has(key)) {
                        courseMap.set(key, []);
                    }
                    courseMap.get(key)!.push(course);
                }
            });
        });

        const results: CourseStatistics[] = [];

        courseMap.forEach((courses, key) => {
            const [courseName, teacher] = key.split('-');
            const stats = this.calculateCourseStatistics(courseName, teacher, courses);
            results.push(stats);
        });

        return results.sort((a, b) => a.courseName.localeCompare(b.courseName));
    }

    /**
     * 计算课程统计信息
     */
    private calculateCourseStatistics(courseName: string, teacher: string, courses: CourseGrade[]): CourseStatistics {
        const scores = courses.map(c => c.normalizedScore);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        const passedCount = courses.filter(c => c.isPassed).length;
        const excellentCount = courses.filter(c => c.normalizedScore >= 90).length;
        const failCount = courses.filter(c => !c.isPassed).length;

        const passRate = (passedCount / courses.length) * 100;
        const excellentRate = (excellentCount / courses.length) * 100;

        // 计算分数分布
        const scoreDistribution: ScoreDistribution = {
            excellent: courses.filter(c => c.normalizedScore >= 90).length,
            good: courses.filter(c => c.normalizedScore >= 80 && c.normalizedScore < 90).length,
            medium: courses.filter(c => c.normalizedScore >= 70 && c.normalizedScore < 80).length,
            pass: courses.filter(c => c.normalizedScore >= 60 && c.normalizedScore < 70).length,
            fail: courses.filter(c => c.normalizedScore < 60).length
        };

        return {
            courseName,
            teacher,
            totalStudents: courses.length,
            averageScore,
            passRate,
            excellentRate,
            failCount,
            scoreDistribution
        };
    }

    /**
     * 计算学生个人统计信息
     */
    calculateStudentStats(student: ProcessedStudentData) {
        const validCourses = student.courses.filter(c => !c.isVoid);
        const totalCredits = validCourses.reduce((sum, course) => sum + (course.credit || 0), 0);
        const totalGradePoints = validCourses.reduce((sum, course) => sum + (course.gpa || 0) * (course.credit || 0), 0);
        const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

        const passedCourses = validCourses.filter(c => c.isPassed);
        const failedCourses = validCourses.filter(c => !c.isPassed);

        return {
            totalCourses: validCourses.length,
            totalCredits: Math.round(totalCredits * 10) / 10, // 保留1位小数
            passedCredits: Math.round(passedCourses.reduce((sum, course) => sum + (course.credit || 0), 0) * 10) / 10,
            gpa: Math.round(gpa * 100) / 100, // 保留2位小数
            failedCount: failedCourses.length,
            failedCourses: failedCourses.map(c => c.courseName || '未知课程'),
            averageScore: validCourses.length > 0 ?
                Math.round((validCourses.reduce((sum, course) => sum + (course.normalizedScore || 0), 0) / validCourses.length) * 100) / 100 : 0
        };
    }
}

// 导出单例实例
export const dataAnalyzer = new DataAnalyzer();