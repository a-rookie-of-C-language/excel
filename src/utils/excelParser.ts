import * as XLSX from 'xlsx';
import type { 
  StudentGradeRecord, 
  ProcessedStudentData, 
  CourseGrade,
  ValidationResult, 
  BasicInfo, 
  GradeSystemInfo 
} from '@/types';


const FIELD_MAPPING: Record<string, keyof StudentGradeRecord> = {
  '班级': 'className',
  '学号': 'studentId',
  '姓名': 'studentName',
  '课程名称': 'courseName',
  '成绩': 'score',
  '学年': 'academicYear',
  '学期': 'semester',
  '学生类别': 'studentType',
  '学院': 'college',
  '专业': 'major',
  '年级': 'grade',
  '学生标记': 'studentMark',
  '开课学院': 'teachingCollege',
  '课程代码': 'courseCode',
  '教学班': 'teachingClass',
  '任课教师': 'teacher',
  '学分': 'credit',
  '成绩备注': 'scoreRemark',
  '考试性质': 'examNature',
  '绩点': 'gradePoint',
  '课程标记': 'courseMark',
  '课程类别': 'courseCategory',
  '课程归属': 'courseBelonging',
  '课程性质': 'courseNature',
  '考核方式': 'assessmentMethod',
  '是否成绩作废': 'isScoreVoid',
  '提交人': 'submitter',
  '提交时间': 'submitTime',
  '是否学位课程': 'isDegreeRequired',
  '性别': 'gender',
  '专业方向': 'majorDirection',
  '课程英文名称': 'courseNameEn',
  '备注信息': 'remarks',
  '学分绩点': 'creditGradePoint',
  '开课类型': 'courseType'
};

// 必需字段列表 - 根据35字段更新
const REQUIRED_FIELDS = [
  '班级', '学号', '姓名', '课程名称', '成绩', '学年', '学期', 
  '专业', '年级', '课程代码', '任课教师', '学分'
];

// 等级制成绩映射
const GRADE_LEVEL_MAPPING: Record<string, number> = {
  '优秀': 95,
  '良好': 85,
  '中等': 75,
  '合格': 65,
  '及格': 60,
  '不合格': 50,
  '不及格': 50,
  '缺考': 0,
  '作弊': 0
};

export class ExcelParser {
  /**
   * 解析Excel文件
   */
  async parseFile(file: File): Promise<StudentGradeRecord[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 获取第一个工作表
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 转换为JSON格式
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            throw new Error('Excel文件为空');
          }
          
          // 解析数据
          const records = this.parseJsonData(jsonData as any[][]);
          resolve(records);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 解析JSON数据为StudentGradeRecord数组
   */
  private parseJsonData(jsonData: any[][]): StudentGradeRecord[] {
    if (jsonData.length < 2) {
      throw new Error('Excel文件格式错误：至少需要包含表头和数据行');
    }

    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1);

    // 创建字段索引映射
    const fieldIndexMap: Record<keyof StudentGradeRecord, number> = {} as any;
    
    headers.forEach((header, index) => {
      const englishField = FIELD_MAPPING[header];
      if (englishField) {
        fieldIndexMap[englishField] = index;
      }
    });

    // 解析数据行
    const records: StudentGradeRecord[] = [];
    
    dataRows.forEach((row, rowIndex) => {
      if (row.length === 0 || !row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
        return; // 跳过空行
      }

      const record: Partial<StudentGradeRecord> = {};
      
      // 填充字段数据
      Object.entries(fieldIndexMap).forEach(([field, index]) => {
        const value = row[index];
        
        if (field === 'credit') {
          (record as any)[field] = this.parseCredit(value);
        } else if (field === 'gradePoint' || field === 'creditGradePoint') {
          (record as any)[field] = this.parseNumber(value);
        } else if (field === 'isDegreeRequired' || field === 'isScoreVoid') {
          (record as any)[field] = this.parseBoolean(value);
        } else {
          (record as any)[field] = this.parseString(value);
        }
      });

      // 验证必需字段
      const missingFields = REQUIRED_FIELDS.filter(chineseField => {
        const englishField = FIELD_MAPPING[chineseField];
        return !record[englishField] && record[englishField] !== 0;
      });

      if (missingFields.length === 0) {
        records.push(record as StudentGradeRecord);
      } else {
        console.warn(`第${rowIndex + 2}行缺少必需字段: ${missingFields.join(', ')}`);
      }
    });

    return records;
  }

  /**
   * 验证35字段格式
   */
  validate35Fields(data: StudentGradeRecord[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];
    const invalidRecords: number[] = [];

    if (data.length === 0) {
      errors.push('没有有效的数据记录');
      return {
        isValid: false,
        errors,
        warnings,
        missingFields,
        invalidRecords
      };
    }

    // 检查字段完整性
    const firstRecord = data[0];
    const requiredEnglishFields = REQUIRED_FIELDS.map(field => FIELD_MAPPING[field]);
    
    requiredEnglishFields.forEach(field => {
      if (!(field in firstRecord)) {
        missingFields.push(field);
      }
    });

    // 验证每条记录
    data.forEach((record, index) => {
      const recordErrors: string[] = [];

      // 验证学号格式
      if (!record.studentId || !/^\d+$/.test(record.studentId)) {
        recordErrors.push('学号格式错误');
      }

      // 验证学分
      if (record.credit <= 0) {
        recordErrors.push('学分必须大于0');
      }

      // 验证成绩
      if (!this.isValidScore(record.score)) {
        recordErrors.push('成绩格式错误');
      }

      if (recordErrors.length > 0) {
        invalidRecords.push(index);
        warnings.push(`第${index + 1}条记录: ${recordErrors.join(', ')}`);
      }
    });

    const isValid = errors.length === 0 && missingFields.length === 0;

    return {
      isValid,
      errors,
      warnings,
      missingFields,
      invalidRecords
    };
  }

  /**
   * 标准化成绩数据
   */
  normalizeGrades(records: StudentGradeRecord[]): ProcessedStudentData[] {
    const studentMap = new Map<string, ProcessedStudentData>();

    records.forEach(record => {
      const studentId = record.studentId;
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId: record.studentId,
          studentName: record.studentName,
          className: record.className,
          studentType: record.studentType,
          college: record.college,
          major: record.major,
          grade: record.grade,
          gender: record.gender,
          semester: record.semester,
          courses: [],
          gpa: 0,
          totalCredits: 0,
          passedCredits: 0,
          failedCount: 0,
          courseCount: 0
        });
      }

      const student = studentMap.get(studentId)!;
      const normalizedScore = this.normalizeScore(record.score);
      
      const courseGrade: CourseGrade = {
        courseName: record.courseName,
        courseCode: record.courseCode,
        teacher: record.teacher,
        credit: record.credit,
        score: normalizedScore,
        normalizedScore,
        gpa: record.gradePoint || this.calculateGPA(normalizedScore),
        isPassed: normalizedScore >= 60,
        courseType: record.courseType,
        semester: record.semester,
        status: normalizedScore >= 60 ? '及格' : '不及格',
        isVoid: record.isScoreVoid
      };

      student.courses.push(courseGrade);
    });

    // 计算每个学生的统计信息
    const processedStudents = Array.from(studentMap.values()).map(student => {
      const validCourses = student.courses.filter(c => !c.isVoid);
      const totalCredits = validCourses.reduce((sum, course) => sum + course.credit, 0);
      const passedCourses = validCourses.filter(c => c.isPassed);
      const passedCredits = passedCourses.reduce((sum, course) => sum + course.credit, 0);
      const failedCount = validCourses.filter(c => !c.isPassed).length;
      
      // 计算GPA (使用学分加权平均)
      const totalGradePoints = validCourses.reduce((sum, course) => {
        // 如果原始数据有绩点，使用原始绩点；否则根据成绩计算绩点
        const gpa = course.gpa || this.calculateGPA(course.normalizedScore);
        return sum + gpa * course.credit;
      }, 0);
      
      const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
      
      return {
        ...student,
        gpa: Number(gpa.toFixed(2)),
        totalCredits: Number(totalCredits.toFixed(1)),
        passedCredits: Number(passedCredits.toFixed(1)),
        failedCount,
        courseCount: validCourses.length
      };
    });

    return processedStudents;
  }

  /**
   * 提取基本信息
   */
  extractBasicInfo(data: StudentGradeRecord[]): BasicInfo {
    const semesters = new Set<string>();
    const grades = new Set<string>();
    const majors = new Set<string>();
    const courses = new Set<string>();
    const teachers = new Set<string>();
    const colleges = new Set<string>();
    const students = new Set<string>();

    data.forEach(record => {
      semesters.add(record.semester);
      grades.add(record.grade);
      majors.add(record.major);
      courses.add(record.courseName);
      teachers.add(record.teacher);
      colleges.add(record.college);
      students.add(record.studentId);
    });

    return {
      semester: Array.from(semesters).join(', '),
      grade: Array.from(grades).join(', '),
      totalStudents: students.size,
      majors: Array.from(majors),
      courses: Array.from(courses),
      teachers: Array.from(teachers),
      colleges: Array.from(colleges)
    };
  }

  /**
   * 检测成绩制度
   */
  detectGradeSystem(records: StudentGradeRecord[]): GradeSystemInfo {
    let hasPercentageGrades = false;
    let hasLevelGrades = false;
    const levelGradeTypes = new Set<string>();

    records.forEach(record => {
      const score = record.score;
      
      if (typeof score === 'number') {
        hasPercentageGrades = true;
      } else if (typeof score === 'string') {
        if (/^\d+(\.\d+)?$/.test(score)) {
          hasPercentageGrades = true;
        } else if (GRADE_LEVEL_MAPPING[score]) {
          hasLevelGrades = true;
          levelGradeTypes.add(score);
        }
      }
    });

    return {
      hasPercentageGrades,
      hasLevelGrades,
      levelGradeTypes: Array.from(levelGradeTypes),
      mixedSystem: hasPercentageGrades && hasLevelGrades
    };
  }

  /**
   * 标准化成绩为百分制
   */
  private normalizeScore(score: string | number): number {
    if (typeof score === 'number') {
      return score;
    }

    if (typeof score === 'string') {
      // 尝试解析为数字
      const numScore = parseFloat(score);
      if (!isNaN(numScore)) {
        return numScore;
      }

      // 等级制成绩转换
      if (GRADE_LEVEL_MAPPING[score]) {
        return GRADE_LEVEL_MAPPING[score];
      }
    }

    return 0; // 无法解析的成绩默认为0
  }

  /**
   * 根据百分制成绩计算GPA (4.0制)
   */
  private calculateGPA(score: number): number {
    if (score >= 90) return 4.0;
    if (score >= 85) return 3.7;
    if (score >= 82) return 3.3;
    if (score >= 78) return 3.0;
    if (score >= 75) return 2.7;
    if (score >= 72) return 2.3;
    if (score >= 68) return 2.0;
    if (score >= 64) return 1.5;
    if (score >= 60) return 1.0;
    return 0.0;
  }

  /**
   * 验证成绩格式
   */
  private isValidScore(score: string | number): boolean {
    if (typeof score === 'number') {
      return score >= 0 && score <= 100;
    }

    if (typeof score === 'string') {
      // 数字格式
      const numScore = parseFloat(score);
      if (!isNaN(numScore)) {
        return numScore >= 0 && numScore <= 100;
      }

      // 等级制格式
      return GRADE_LEVEL_MAPPING.hasOwnProperty(score);
    }

    return false;
  }

  /**
   * 解析字符串
   */
  private parseString(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return String(value).trim();
  }

  /**
   * 解析数字
   */
  private parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * 解析学分（保留1位小数）
   */
  private parseCredit(value: any): number {
    const num = this.parseNumber(value);
    // 学分通常是0.5的倍数，保留1位小数
    return Number(num.toFixed(1));
  }

  /**
   * 解析布尔值
   */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      return lowerValue === 'true' || lowerValue === '是' || lowerValue === '1';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  }
}

// 导出单例实例
export const excelParser = new ExcelParser();