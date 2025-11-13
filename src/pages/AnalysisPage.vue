<template>
  <div class="analysis-page p-6 bg-gray-50 min-h-screen">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">成绩分析报告</h1>
      <p class="text-gray-600">基于导入的成绩数据进行多维度分析</p>
    </div>

    <!-- 数据检查 -->
    <div v-if="!hasData" class="text-center py-12">
      <el-empty description="暂无数据">
        <template #image>
          <div class="text-6xl text-gray-300 mb-4">📊</div>
        </template>
        <template #description>
          <p class="text-gray-500 mb-4">请先导入Excel成绩数据</p>
        </template>
        <el-button type="primary" @click="goToImport">
          <el-icon><Upload /></el-icon>
          导入数据
        </el-button>
      </el-empty>
    </div>

    <!-- 分析内容 -->
    <div v-else>
      <!-- 基本信息卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-blue-100 text-blue-600">
              <el-icon><User /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ dataStore.totalStudents }}</div>
              <div class="text-sm text-gray-600">学生总数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-green-100 text-green-600">
              <el-icon><Document /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ safeToFixed(avgCourseCount, 2) }}</div>
              <div class="text-sm text-gray-600">平均课程数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-purple-100 text-purple-600">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ overallGPA }}</div>
              <div class="text-sm text-gray-600">平均GPA</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-red-100 text-red-600">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ safeToFixed(failureRate, 2) }}%</div>
              <div class="text-sm text-gray-600">不及格率</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-orange-100 text-orange-600">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ warningCount }}</div>
              <div class="text-sm text-gray-600">学业预警</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分析选项卡 -->
      <el-tabs v-model="activeTab" class="analysis-tabs">
        <!-- 学期成绩汇总 -->
        <el-tab-pane label="学期成绩汇总" name="semester" lazy>
          <div class="bg-white rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">各专业学期成绩汇总</h3>
              <div class="flex gap-2">
                <el-select v-model="selectedGrade" placeholder="选择年级" style="width: 120px" clearable>
                  <el-option
                    v-for="grade in gradeOptions"
                    :key="grade"
                    :label="grade"
                    :value="grade"
                  />
                </el-select>
                <el-select v-model="selectedClass" placeholder="选择班级" style="width: 150px" clearable>
                  <el-option
                    v-for="className in classOptions"
                    :key="className"
                    :label="className"
                    :value="className"
                  />
                </el-select>
                <el-select v-model="selectedMajor" placeholder="选择专业" style="width: 180px" clearable>
                  <el-option
                    v-for="major in majorOptions"
                    :key="major"
                    :label="major"
                    :value="major"
                  />
                </el-select>
                <el-select v-model="selectedSemester" placeholder="选择学期" style="width: 150px" clearable>
                  <el-option
                    v-for="semester in semesterOptions"
                    :key="semester"
                    :label="semester"
                    :value="semester"
                  />
                </el-select>
                <el-button type="primary" @click="exportSemesterData">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>
            
            <el-table :data="semesterSummary" border stripe>
              <el-table-column prop="major" label="专业" width="200" />
              <el-table-column prop="totalStudents" label="学生数" width="100" />
              <el-table-column prop="totalExamCount" label="人次" width="100" />
              <el-table-column prop="averageGPA" label="平均GPA" width="120">
                <template #default="{ row }">
                  <el-tag :type="getGPATagType(row.averageGPA)">
                    {{ safeToFixed(row.averageGPA, 2) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="excellentRate" label="优秀率" width="120">
                <template #default="{ row }">
                  <span class="text-sm">{{ safePercentage(row.excellentRate, 2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="failureRate" label="不及格率" width="120">
                <template #default="{ row }">
                  <span class="text-sm">{{ safePercentage(row.failureRate, 2) }}</span>
                </template>
              </el-table-column>
              <!-- 新增：优秀/不及格 人数与人次 -->
              <el-table-column prop="excellentStudentCount" label="优秀人数" width="110">
                <template #default="{ row }">
                  <el-tag type="success">{{ row.excellentStudentCount }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="excellentExamCount" label="优秀人次" width="110">
                <template #default="{ row }">
                  <el-tag type="success">{{ row.excellentExamCount }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="failedStudentCount" label="不及格人数" width="110">
                <template #default="{ row }">
                  <el-tag type="danger">{{ row.failedStudentCount }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="failedExamCount" label="不及格人次" width="110">
                <template #default="{ row }">
                  <el-tag type="danger">{{ row.failedExamCount }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="totalCredits" label="总学分" width="100" />
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="课程成绩分析" name="final" lazy>
          <div class="bg-white rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">课程成绩分析</h3>
              <div class="flex gap-2">
                <el-select v-model="selectedGrade" placeholder="选择年级" style="width: 120px" clearable>
                  <el-option
                    v-for="grade in gradeOptions"
                    :key="grade"
                    :label="grade"
                    :value="grade"
                  />
                </el-select>
                <el-select v-model="selectedClass" placeholder="选择班级" style="width: 150px" clearable>
                  <el-option
                    v-for="className in classOptions"
                    :key="className"
                    :label="className"
                    :value="className"
                  />
                </el-select>
                <el-select v-model="selectedMajor" placeholder="选择专业" style="width: 200px">
                  <el-option label="全部专业" value="" />
                  <el-option
                    v-for="major in majorOptions"
                    :key="major"
                    :label="major"
                    :value="major"
                  />
                </el-select>
                <!-- 通识课程显示开关 -->
                <el-switch
                  v-model="showGeneralCourses"
                  active-text="显示通识"
                  inactive-text="隐藏通识"
                />
                <!-- 补考课程显示开关 -->
                <el-switch
                  v-model="showMakeupCourses"
                  active-text="显示补考"
                  inactive-text="隐藏补考"
                />
                <el-button type="primary" @click="exportFinalData">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>

            <el-table :data="finalExamsAnalysis" border stripe>
              <el-table-column prop="courseName" label="课程名称" width="200" />
              <el-table-column prop="courseCode" label="课程代码" width="120" />
              <el-table-column prop="teacher" label="任课教师" width="150">
                <template #default="{ row }">
                  <el-tooltip
                    v-if="row.teacher === '多位老师' && Array.isArray(row.teacherList) && row.teacherList.length > 0"
                    :content="row.teacherList.join('、')"
                    placement="top"
                  >
                    <span class="text-blue-600 cursor-help">多位老师</span>
                  </el-tooltip>
                  <span v-else>{{ row.teacher }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="major" label="专业" width="150" />
              <el-table-column prop="studentCount" label="学生数" width="100" />
              <el-table-column prop="avgScore" label="平均分" width="100">
                <template #default="{ row }">
                  <el-tag :type="getScoreTagType(row.avgScore)">
                    {{ safeToFixed(row.avgScore, 2) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="passRate" label="及格率" width="120">
                <template #default="{ row }">
                  {{ safePercentage(row.passRate, 2) }}
                </template>
              </el-table-column>
              <el-table-column prop="excellentRate" label="优秀率" width="120">
                <template #default="{ row }">
                  {{ safePercentage(row.excellentRate, 2) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="text" @click="viewCourseDetail(row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 年级专业分析 -->
        <el-tab-pane label="年级专业分析" name="grade" lazy>
          <div class="grid grid-cols-1 gap-6">
            <!-- 各年级各专业成绩分析表 -->
            <div class="bg-white rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">各年级各专业成绩分析</h3>
              <!-- 筛选栏：年级 / 专业  -->
              <div class="flex items-center gap-3 mb-4">
                <el-select v-model="selectedGrade" placeholder="选择年级" style="width: 120px" clearable>
                  <el-option
                    v-for="grade in gradeOptions"
                    :key="grade"
                    :label="grade"
                    :value="grade"
                  />
                </el-select>
                <el-select v-model="selectedMajor" placeholder="选择专业" style="width: 180px" clearable>
                  <el-option
                    v-for="major in majorOptions"
                    :key="major"
                    :label="major"
                    :value="major"
                  />
                </el-select>
                <el-button type="primary" @click="exportGradeMajorData">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
              <el-table :data="gradeAndMajorAnalysis" border stripe max-height="400">
                <el-table-column prop="grade" label="年级" width="100" />
                <el-table-column prop="major" label="专业" width="150" />
                <el-table-column prop="averageGPA" label="平均GPA" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getGPATagType(row.averageGPA)">
                      {{ safeToFixed(row.averageGPA, 2) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="averageScore" label="平均分" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getScoreTagType(row.averageScore)">
                      {{ safeToFixed(row.averageScore, 2) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="passRate" label="及格率" width="120">
                  <template #default="{ row }">
                    <span class="text-sm">{{ safePercentage(row.passRate, 2) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="excellentRate" label="优秀率" width="120">
                  <template #default="{ row }">
                    <span class="text-sm">{{ safePercentage(row.excellentRate, 2) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="failureRate" label="不及格率" width="120">
                  <template #default="{ row }">
                    <span class="text-sm">{{ safePercentage(row.failureRate, 2) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="topCourses" label="优势课程" min-width="160">
                  <template #default="{ row }">
                    <el-tag
                      v-for="course in row.topCourses"
                      :key="course"
                      type="success"
                      size="small"
                      class="mr-1 mb-1"
                    >
                      {{ course }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="weakCourses" label="薄弱课程" min-width="160">
                  <template #default="{ row }">
                    <el-tag
                      v-for="course in row.weakCourses"
                      :key="course"
                      type="danger"
                      size="small"
                      class="mr-1 mb-1"
                    >
                      {{ course }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 教师教学分析 -->
        <el-tab-pane label="教师教学分析" name="teacher" lazy>
          <div class="bg-white rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">教师教学情况分析</h3>
              <el-button type="primary" @click="exportTeacherData">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>

            <!-- 筛选栏：年级 / 专业 / 班级 / 课程 -->
            <div class="flex items-center gap-3 mb-4">
              <el-select v-model="selectedGrade" placeholder="选择年级" style="width: 120px" clearable>
                <el-option
                  v-for="grade in gradeOptions"
                  :key="grade"
                  :label="grade"
                  :value="grade"
                />
              </el-select>
              <el-select v-model="selectedMajor" placeholder="选择专业" style="width: 180px" clearable>
                <el-option
                  v-for="major in majorOptions"
                  :key="major"
                  :label="major"
                  :value="major"
                />
              </el-select>
              <el-select v-model="selectedClass" placeholder="选择班级" style="width: 150px" clearable>
                <el-option
                  v-for="className in classOptions"
                  :key="className"
                  :label="className"
                  :value="className"
                />
              </el-select>
            
            </div>

            <el-table :data="teacherAnalysis" border stripe>
              <el-table-column prop="teacher" label="教师姓名" width="120" />
              <el-table-column prop="courseCount" label="授课数量" width="100" />
              <el-table-column prop="studentCount" label="学生总数" width="100" />
              <el-table-column prop="avgScore" label="平均分" width="100">
                <template #default="{ row }">
                  <el-tag :type="getScoreTagType(row.avgScore)">
                    {{ safeToFixed(row.avgScore, 2) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="passRate" label="及格率" width="120">
                <template #default="{ row }">
                  <span class="text-sm">{{ safePercentage(row.passRate, 2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="excellentRate" label="优秀率" width="120">
                <template #default="{ row }">
                  {{ safePercentage(row.excellentRate, 2) }}
                </template>
              </el-table-column>
              <el-table-column prop="courses" label="授课课程" min-width="200">
                <template #default="{ row }">
                  <el-tag
                    v-for="course in row.courses.slice(0, 3)"
                    :key="course"
                    type="info"
                    size="small"
                    class="mr-1 mb-1"
                  >
                    {{ course }}
                  </el-tag>
                  <span v-if="row.courses.length > 3" class="text-gray-500 text-sm">
                    等{{ row.courses.length }}门课程
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 高挂科率科目分析 -->
        <el-tab-pane label="高挂科率科目分析" name="highFailure" lazy>
          <div class="bg-white rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">高挂科率科目分析 (挂科率 > 10%)</h3>
              <div class="flex gap-2 items-center">
                <el-switch
                  v-model="mergeHighFailureCourses"
                  active-text="同名课程合并"
                  inactive-text="按教师/班级分组"
                />
                <el-select v-model="selectedGrade" placeholder="选择年级" style="width: 120px" clearable>
                  <el-option
                    v-for="grade in gradeOptions"
                    :key="grade"
                    :label="grade"
                    :value="grade"
                  />
                </el-select>
                <el-select v-model="selectedMajor" placeholder="选择专业" style="width: 180px" clearable>
                  <el-option
                    v-for="major in majorOptions"
                    :key="major"
                    :label="major"
                    :value="major"
                  />
                </el-select>
                <el-select v-model="selectedClass" placeholder="选择班级" style="width: 150px" clearable>
                  <el-option
                    v-for="className in classOptions"
                    :key="className"
                    :label="className"
                    :value="className"
                  />
                </el-select>
                <el-button type="primary" @click="exportHighFailureData">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>

            <el-table :data="highFailureCourses" border stripe>
              <el-table-column prop="courseName" label="课程名称" width="200" />
              <el-table-column prop="courseCode" label="课程代码" width="120" />
              <el-table-column prop="teacher" label="任课教师" width="120">
                <template #default="{ row }">
                  <el-tooltip
                    v-if="row.teacher === '多位老师' && Array.isArray(row.teacherList) && row.teacherList.length > 0"
                    :content="row.teacherList.join('、')"
                    placement="top"
                  >
                    <span class="text-blue-600 cursor-help">多位老师</span>
                  </el-tooltip>
                  <span v-else>{{ row.teacher }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="grade" label="年级" width="100" />
              <el-table-column prop="major" label="专业" width="150" />
              <el-table-column prop="className" label="班级" width="120" />
              <el-table-column prop="studentCount" label="学生数" width="100" />
              <el-table-column prop="failedCount" label="不及格人数" width="120">
                <template #default="{ row }">
                  <el-tag type="danger">{{ row.failedCount }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="failureRate" label="挂科率" width="120">
                <template #default="{ row }">
                  <span class="text-sm font-bold text-red-600">{{ safePercentage(row.failureRate, 2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="avgScore" label="平均分" width="100">
                <template #default="{ row }">
                  <el-tag :type="getScoreTagType(row.avgScore)">
                    {{ safeToFixed(row.avgScore, 2) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="maxScore" label="最高分" width="100" />
              <el-table-column prop="minScore" label="最低分" width="100" />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button type="text" @click="viewCourseDetail(row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 统计信息 -->
            <div v-if="highFailureCourses.length > 0" class="mt-4 p-4 bg-red-50 rounded-lg">
              <div class="text-sm text-red-800">
                <p>共发现 <span class="font-bold">{{ highFailureCourses.length }}</span> 门高挂科率课程（挂科率 > 10%）</p>
                <p>涉及学生 <span class="font-bold">{{ totalHighFailureStudents }}</span> 人次，不及格 <span class="font-bold">{{ totalHighFailureCount }}</span> 人次</p>
                <p>平均挂科率为 <span class="font-bold">{{ safePercentage(avgHighFailureRate, 2) }}</span></p>
              </div>
            </div>

            <div v-else class="text-center text-gray-500 py-8">
              <el-icon class="text-4xl mb-2"><Document /></el-icon>
              <p>暂无高挂科率课程（挂科率 > 10%）</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 课程详情弹窗 -->
    <el-dialog
      v-model="showCourseDetail"
      title="课程详细分析"
      width="80%"
      :before-close="handleCloseDetail"
    >
      <div v-if="selectedCourse">
        <!-- 课程基本信息 -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 class="text-lg font-semibold text-blue-800 mb-3">课程基本信息</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-600">课程名称：</span>{{ selectedCourse.courseName }}</div>
            <div><span class="text-gray-600">课程代码：</span>{{ selectedCourse.courseCode || '暂无' }}</div>
            <div class="flex items-center">
              <span class="text-gray-600 mr-1">任课教师：</span>
              <template v-if="selectedCourse.teacher === '多位老师' && Array.isArray(selectedCourse.teacherList) && selectedCourse.teacherList.length > 0">
                <el-tooltip :content="selectedCourse.teacherList.join('、')" placement="top">
                  <span class="text-blue-600 cursor-help">多位老师</span>
                </el-tooltip>
              </template>
              <template v-else>
                <span>{{ selectedCourse.teacher }}</span>
              </template>
            </div>
            <div><span class="text-gray-600">学生人数：</span>{{ selectedCourse.studentCount }}人</div>
          </div>
        </div>

        <!-- 成绩统计卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <el-card>
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ safeToFixed(selectedCourse.averageScore, 2) }}</div>
                  <div class="text-sm text-gray-600">平均分</div>
                </div>
              </el-card>
          <el-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ safePercentage(selectedCourse.passRate, 2) }}</div>
              <div class="text-sm text-gray-600">及格率</div>
            </div>
          </el-card>
          <el-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ safePercentage(selectedCourse.excellentRate, 2) }}</div>
              <div class="text-sm text-gray-600">优秀率</div>
            </div>
          </el-card>
        </div>

        <!-- 成绩分布图表 -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 class="font-semibold mb-2">成绩分布详情</h4>
          <div ref="courseDetailChartRef" style="height: 300px;"></div>
        </div>

        <!-- 优秀学生列表（通识课程不显示） -->
        <div v-if="excellentStudents.length > 0 && !selectedCourse.courseName.includes('通识') && !selectedCourse.courseName.includes('公共')" class="mb-6">
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-green-800 mb-3">
              优秀学生 ({{ excellentStudents.length }}人)
              <el-tag type="success" size="small" class="ml-2">分数&ge;90分</el-tag>
            </h4>
            <el-table :data="excellentStudents" border stripe max-height="300">
              <el-table-column prop="studentId" label="学号" width="120" />
              <el-table-column prop="studentName" label="姓名" width="100" />
              <el-table-column prop="className" label="班级" width="120" />
              <el-table-column prop="major" label="专业" width="150" />
              <el-table-column prop="grade" label="年级" width="80" />
              <el-table-column prop="score" label="成绩" width="100">
                <template #default="{ row }">
                  <el-tag type="success">{{ safeToFixed(row.score, 2) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="gpa" label="绩点" width="80">
                <template #default="{ row }">
                  <el-tag :type="getGPATagType(row.gpa)" size="small">
                    {{ safeToFixed(row.gpa, 2) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 不及格学生列表 -->
        <div v-if="failingStudents.length > 0" class="mb-6">
          <div class="bg-red-50 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-red-800 mb-3">
              不及格学生 ({{ failingStudents.length }}人)
              <el-tag type="danger" size="small" class="ml-2">分数&lt;60分</el-tag>
            </h4>
            <el-table :data="failingStudents" border stripe max-height="300">
              <el-table-column prop="studentId" label="学号" width="120" />
              <el-table-column prop="studentName" label="姓名" width="100" />
              <el-table-column prop="className" label="班级" width="120" />
              <el-table-column prop="major" label="专业" width="150" />
              <el-table-column prop="grade" label="年级" width="80" />
              <el-table-column prop="score" label="成绩" width="100">
                <template #default="{ row }">
                  <el-tag type="danger">{{ safeToFixed(row.score, 2) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="gpa" label="绩点" width="80">
                <template #default="{ row }">
                  <el-tag :type="getGPATagType(row.gpa)" size="small">
                    {{ safeToFixed(row.gpa, 2) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 提示信息 -->
        <div v-if="excellentStudents.length === 0 && failingStudents.length === 0" class="text-center text-gray-500 py-8">
          <el-icon class="text-4xl mb-2"><Document /></el-icon>
          <p>暂无学生数据</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Document,
  TrendCharts,
  Upload,
  Download,
  Warning,
  Bell
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { DataAnalyzer } from '@/utils/dataAnalyzer'
import { useDataStore } from '@/stores/dataStore'
import { safeToFixed, safePercentage } from '@/utils/numberUtils'
import { exportToExcel } from '@/utils/excelExporter'

const router = useRouter()
const dataStore = useDataStore()
const dataAnalyzer = new DataAnalyzer()

// 响应式数据
const activeTab = ref('semester')
const selectedSemester = ref('')
const selectedGrade = ref('全部年级')
const selectedClass = ref('')
const selectedMajor = ref('')
const showCourseDetail = ref(false)
const selectedCourse = ref<any>(null)
const excellentStudents = ref<any[]>([])
const failingStudents = ref<any[]>([])

// 从store获取数据
const rawStudentData = computed(() => dataStore.processedData)

// 图表引用
const gpaChartRef = ref<HTMLElement>()
const courseDetailChartRef = ref<HTMLElement>()

// 图表实例
let gpaChart: echarts.ECharts | null = null
let courseDetailChart: echarts.ECharts | null = null

// 可见性与尺寸检查
const isContainerReady = (el?: HTMLElement) => {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  const style = window.getComputedStyle(el)
  return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
}

// 计算属性
const hasData = computed(() => dataStore.isDataLoaded && rawStudentData.value.length > 0)

const overallGPA = computed(() => {
  if (!hasData.value) return '0.00'
  const totalCredits = rawStudentData.value.reduce((sum, student) => {
    const validCourses = student.courses.filter(c => !c.isVoid && c.credit > 0)
    return sum + validCourses.reduce((courseSum, course) => courseSum + course.credit, 0)
  }, 0)
  
  const totalGradePoints = rawStudentData.value.reduce((sum, student) => {
    const validCourses = student.courses.filter(c => !c.isVoid && c.credit > 0 && c.gpa > 0)
    return sum + validCourses.reduce((courseSum, course) => courseSum + course.gpa * course.credit, 0)
  }, 0)
  
  return totalCredits > 0 ? safeToFixed(totalGradePoints / totalCredits, 2) : '0.00'
})

// 平均课程数
const avgCourseCount = computed(() => {
  if (!hasData.value || rawStudentData.value.length === 0) return 0
  const totalCourses = rawStudentData.value.reduce((sum, student) => {
    return sum + student.courses.filter(c => !c.isVoid).length
  }, 0)
  return totalCourses / rawStudentData.value.length
})

// 不及格率
const failureRate = computed(() => {
  if (!hasData.value) return 0
  let totalCourses = 0
  let failedCourses = 0
  
  rawStudentData.value.forEach(student => {
    student.courses.forEach(course => {
      if (!course.isVoid && course.score !== undefined && course.score !== null) {
        totalCourses++
        if (course.score < 60) {
          failedCourses++
        }
      }
    })
  })
  
  return totalCourses > 0 ? (failedCourses / totalCourses) * 100 : 0
})

// 学业预警数量（统一标准：排除通识课程后挂科学分 > 2）
const warningCount = computed(() => {
  if (!hasData.value) return 0
  return rawStudentData.value.filter(student => {
    const validCourses = student.courses.filter(c => !c.isVoid && c.score !== undefined && c.score !== null)
    if (validCourses.length === 0) return false

    // 排除通识课程后计算挂科学分
    const failedCreditsExclGeneral = validCourses
      .filter(c => {
        const name = (c.courseName || '').toLowerCase()
        const code = (c.courseCode || '').toUpperCase()
        const isGeneral = name.includes('通识') || code.startsWith('TS') || code.startsWith('GEN')
        return c.score < 60 && !isGeneral
      })
      .reduce((sum, c) => sum + (typeof c.credit === 'number' ? c.credit : 0), 0)

    return failedCreditsExclGeneral > 2
  }).length
})

const semesterOptions = computed(() => {
  if (!hasData.value) return []
  const semesters = new Set<string>()
  dataStore.rawData.forEach(record => {
    semesters.add(record.semester)
  })
  return Array.from(semesters).sort()
})

const majorOptions = computed(() => {
  if (!hasData.value) return []
  return dataStore.majors
})

const classOptions = computed(() => {
  if (!hasData.value) return []
  const classes = new Set<string>()
  dataStore.rawData.forEach(record => {
    if (record.className) classes.add(record.className)
  })
  return Array.from(classes).sort()
})

const gradeOptions = computed(() => {
  if (!hasData.value) return ['全部年级']
  const grades = new Set<string>()
  dataStore.rawData.forEach(record => {
    if (record.grade) grades.add(record.grade)
  })
  return ['全部年级', ...Array.from(grades).sort()]
})

// 教师分析筛选：课程选项与当前选择
const selectedTeacherCourse = ref('')
const teacherCourseOptions = computed(() => {
  if (!hasData.value) return []
  const normalizeName = (name: string) => (name || '')
    .trim()
    .replace(/[（(]?\s*(?:I{1,3}|Ⅰ|Ⅱ|Ⅲ)\s*[)）]?$/i, '')
    .trim()
  const set = new Set<string>()
  // 依据所选年级、班级、专业过滤后提取课程列表
  rawStudentData.value.forEach(s => {
    const matchGrade = selectedGrade.value === '全部年级' ? true : s.grade === selectedGrade.value
    const matchClass = selectedClass.value ? s.className === selectedClass.value : true
    const matchMajor = selectedMajor.value ? s.major === selectedMajor.value : true
    if (!(matchGrade && matchClass && matchMajor)) return
    (s.courses || []).forEach(c => {
      if (c && !c.isVoid) {
        const n = normalizeName(c.courseName || '')
        if (n) set.add(n)
      }
    })
  })
  return Array.from(set).sort()
})

// 是否显示通识课程（默认显示）
const showGeneralCourses = ref(true)
// 是否显示补考课程（默认显示）
const showMakeupCourses = ref(true)

// 期末成绩分析结果缓存（按筛选条件）
const finalExamsCache = ref(new Map<string, any[]>())
const finalFiltersKey = computed(() => {
  const g = selectedGrade.value || '全部年级'
  const c = selectedClass.value || '全部班级'
  const m = selectedMajor.value || ''
  const general = showGeneralCourses.value ? 'showGeneral' : 'hideGeneral'
  const makeup = showMakeupCourses.value ? 'showMakeup' : 'hideMakeup'
  return `${g}|${c}|${m}|${general}|${makeup}`
})
// 当原始数据变化时清空缓存
watch(() => dataStore.rawData, () => {
  finalExamsCache.value.clear()
}, { deep: true })

const semesterSummary = computed(() => {
  if (!hasData.value) return []
  // 依据所选学期、年级、班级、专业过滤
  const filtered = rawStudentData.value.filter(s => {
    const matchSemester = selectedSemester.value ? s.semester === selectedSemester.value : true
    const matchGrade = selectedGrade.value === '全部年级' ? true : s.grade === selectedGrade.value
    const matchClass = selectedClass.value ? s.className === selectedClass.value : true
    const matchMajor = selectedMajor.value ? s.major === selectedMajor.value : true
    return matchSemester && matchGrade && matchClass && matchMajor
  })
  return dataAnalyzer.analyzeSemesterSummary(filtered)
})

const finalExamsAnalysis = computed(() => {
  if (!hasData.value) return []
  const cacheKey = finalFiltersKey.value
  const cached = finalExamsCache.value.get(cacheKey)
  if (cached) return cached
  const normalizeName = (name: string) => {
    return (name || '')
      .trim()
      .replace(/[（(]?\s*(?:I{1,3}|Ⅰ|Ⅱ|Ⅲ)\s*[)）]?$/i, '')
      .trim()
  }
  // 依据所选年级、班级、专业过滤
  const filteredData = rawStudentData.value.filter(s => {
    const matchGrade = selectedGrade.value === '全部年级' ? true : s.grade === selectedGrade.value
    const matchClass = selectedClass.value ? s.className === selectedClass.value : true
    const matchMajor = selectedMajor.value ? s.major === selectedMajor.value : true
    return matchGrade && matchClass && matchMajor
  })
  // 在进入统计前，依据显示开关对课程进行一次性预过滤，确保汇总不包含被隐藏的课程
  const preFilteredData = filteredData.map(s => ({
    ...s,
    courses: (s.courses || []).filter(c => {
      if (c.isVoid) return false
      // 过滤通识课程
      if (!showGeneralCourses.value && isGeneralCourse({ courseName: c.courseName, courseCode: c.courseCode, teacher: c.teacher })) {
        return false
      }
      // 过滤补考/重修/重考课程（依据考试性质或课程名关键字）
      if (!showMakeupCourses.value && isMakeupCourse({ courseName: c.courseName, examNature: (c as any).examNature, courseCode: c.courseCode })) {
        return false
      }
      return true
    })
  }))

  const finalExamStats = dataAnalyzer.analyzeFinalExamsByMajor(preFilteredData)
  
  // 构建课程代码集合（按标准化课程名称）
  const codesByName = new Map<string, Set<string>>()
  filteredData.forEach(student => {
    student.courses.forEach(c => {
      if (c.isVoid) return
      if (!showGeneralCourses.value && isGeneralCourse({ courseName: c.courseName, courseCode: c.courseCode, teacher: c.teacher })) return
      if (!showMakeupCourses.value && isMakeupCourse({ courseName: c.courseName, courseCode: c.courseCode, examNature: (c as any).examNature })) return
      const norm = normalizeName(c.courseName || '')
      const code = (c.courseCode || '').trim()
      if (!codesByName.has(norm)) codesByName.set(norm, new Set<string>())
      if (code) codesByName.get(norm)!.add(code)
    })
  })

  type Bucket = {
    courseName: string
    teachers: Set<string>
    totalStudents: number
    sumScores: number
    sumPassCount: number
    sumExcellentCount: number
    major: string
  }

  const mergedMap = new Map<string, Bucket>()
  finalExamStats.forEach(majorStat => {
    majorStat.courses
      .filter(course => (showGeneralCourses.value || !isGeneralCourse(course)) && (showMakeupCourses.value || !isMakeupCourse(course)))
      .forEach(course => {
        const normName = normalizeName(course.courseName)
        if (!mergedMap.has(normName)) {
          mergedMap.set(normName, {
            courseName: normName,
            teachers: new Set<string>(),
            totalStudents: 0,
            sumScores: 0,
            sumPassCount: 0,
            sumExcellentCount: 0,
            major: majorStat.major
          })
        }
        const b = mergedMap.get(normName)!
        b.teachers.add(course.teacher || '未知教师')
        b.totalStudents += course.totalStudents
        b.sumScores += (course.averageScore || 0) * course.totalStudents
        b.sumPassCount += (course.passRate || 0) / 100 * course.totalStudents
        b.sumExcellentCount += (course.excellentRate || 0) / 100 * course.totalStudents
      })
  })

  const result: any[] = []
  mergedMap.forEach(b => {
    const avg = b.totalStudents ? b.sumScores / b.totalStudents : 0
    const passRate = b.totalStudents ? (b.sumPassCount / b.totalStudents) * 100 : 0
    const excellentRate = b.totalStudents ? (b.sumExcellentCount / b.totalStudents) * 100 : 0
    const teacherDisplay = b.teachers.size === 0
      ? '未知教师'
      : (b.teachers.size === 1 ? Array.from(b.teachers)[0] : '多位老师')
    const codes = Array.from(codesByName.get(b.courseName) || new Set<string>()).join('、')
    result.push({
      courseName: b.courseName,
      courseCode: codes,
      teacher: teacherDisplay,
      // 用于鼠标悬停显示具体教师名单
      teacherList: Array.from(b.teachers),
      major: b.major,
      studentCount: b.totalStudents,
      avgScore: avg,
      passRate,
      excellentRate
    })
  })
  
  // 缓存结果以加速同条件下的后续访问
  finalExamsCache.value.set(cacheKey, result)
  return result
})

// 与课程成绩分析表相同的筛选逻辑，用于课程详情重算
const getFilteredStudentsForFinal = () => {
  const filteredData = rawStudentData.value.filter(s => {
    const matchGrade = selectedGrade.value === '全部年级' ? true : s.grade === selectedGrade.value
    const matchClass = selectedClass.value ? s.className === selectedClass.value : true
    const matchMajor = selectedMajor.value ? s.major === selectedMajor.value : true
    return matchGrade && matchClass && matchMajor
  })
  return filteredData.map(s => ({
    ...s,
    courses: (s.courses || []).filter(c => {
      if (c.isVoid) return false
      if (!showGeneralCourses.value && isGeneralCourse({ courseName: c.courseName, courseCode: c.courseCode, teacher: c.teacher })) {
        return false
      }
      if (!showMakeupCourses.value && isMakeupCourse({ courseName: c.courseName, examNature: (c as any).examNature, courseCode: c.courseCode })) {
        return false
      }
      return true
    })
  }))
}

const gradeAndMajorAnalysis = computed(() => {
  if (!hasData.value) return []
  // 根据筛选条件过滤学生数据后再进行年级-专业分析
  const filteredStudents = rawStudentData.value.filter(s => {
    const matchGrade = selectedGrade.value === '全部年级' ? true : s.grade === selectedGrade.value
    const matchClass = selectedClass.value ? s.className === selectedClass.value : true
    const matchMajor = selectedMajor.value ? s.major === selectedMajor.value : true
    return matchGrade && matchClass && matchMajor
  })
  const raw = dataAnalyzer.analyzeByGradeAndMajor(filteredStudents)
  // 优势/薄弱课程过滤：排除通识课程与“军事理论”
  const excludeName = (name?: string) => {
    const n = (name || '').toLowerCase()
    return isGeneralCourse({ courseName: n }) || n.includes('军事理论')
  }
  return raw.map(item => ({
    ...item,
    topCourses: (item.topCourses || []).filter(name => !excludeName(name)),
    weakCourses: (item.weakCourses || []).filter(name => !excludeName(name))
  }))
})

const teacherAnalysis = computed(() => {
  if (!hasData.value) return []
  // 依据年级/专业/班级筛选，并按选定课程进一步过滤
  const normalizeName = (name: string) => (name || '')
    .trim()
    .replace(/[（(]?\s*(?:I{1,3}|Ⅰ|Ⅱ|Ⅲ)\s*[)）]?$/i, '')
    .trim()
  const targetCourse = selectedTeacherCourse.value ? normalizeName(selectedTeacherCourse.value) : ''
  const filteredStudents = rawStudentData.value
    .filter(s => {
      const matchGrade = selectedGrade.value === '全部年级' ? true : s.grade === selectedGrade.value
      const matchClass = selectedClass.value ? s.className === selectedClass.value : true
      const matchMajor = selectedMajor.value ? s.major === selectedMajor.value : true
      return matchGrade && matchClass && matchMajor
    })
    .map(s => ({
      ...s,
      courses: (s.courses || []).filter(c => {
        if (c.isVoid) return false
        if (!targetCourse) return true
        return normalizeName(c.courseName || '') === targetCourse
      })
    }))
  const teacherStats = dataAnalyzer.analyzeTeachingPerformance(filteredStudents)
  
  return teacherStats.map(stat => ({
    teacher: stat.teacher || '未知教师',
    courseCount: (stat.courses || []).length,
    studentCount: stat.totalStudents || 0,
    avgScore: stat.averageScore || 0,
    passRate: stat.passRate || 0,
    excellentRate: stat.excellentRate || 0,
    courses: stat.courses || []
  }))
})

// 课程分析数据（按 课程名称 聚合，使用标准化分数；同时聚合多个课程代码）
const courseAnalysisData = computed(() => {
  if (!hasData.value) return []

  const normalizeCourseName = (name: string) => {
    return (name || '')
      .trim()
      // 去掉结尾的罗马数字（I/II/III 或 Ⅰ/Ⅱ/Ⅲ），可能带括号
      .replace(/[（(]?\s*(?:I{1,3}|Ⅰ|Ⅱ|Ⅲ)\s*[)）]?$/i, '')
      .trim()
  }

  type Bucket = {
    sum: number;
    count: number;
    max: number;
    min: number;
    pass: number;
    excellent: number;
    squares: number;
    courseName: string;
    teachers: Set<string>;
    courseCodes: Set<string>;
  }
  const courseMap: Record<string, Bucket> = {}

  // 根据选中的专业过滤数据
  const filteredData = selectedMajor.value ? rawStudentData.value.filter(s => s.major === selectedMajor.value) : rawStudentData.value

  filteredData.forEach(s => {
    s.courses.forEach(c => {
      if (c.isVoid) return
      const score = typeof c.normalizedScore === 'number' && !isNaN(c.normalizedScore) ? c.normalizedScore : null
      if (score == null) return
      const courseName = normalizeCourseName(c.courseName || '未知课程')
      const teacherName = (typeof c.teacher === 'string' && c.teacher.trim().length > 0) ? c.teacher.trim() : '未知教师'
      const code = (c.courseCode || '').trim()
      const key = `${courseName}`
      if (!courseMap[key]) {
        courseMap[key] = { sum: 0, count: 0, max: -Infinity, min: Infinity, pass: 0, excellent: 0, squares: 0, courseName, teachers: new Set<string>(), courseCodes: new Set<string>() }
      }
      const bucket = courseMap[key]
      bucket.courseName = courseName // 保留一个合理的课程名称
      if (teacherName && teacherName.length > 0) bucket.teachers.add(teacherName)
      if (code.length > 0) bucket.courseCodes.add(code)
      bucket.sum += score
      bucket.count += 1
      bucket.max = Math.max(bucket.max, score)
      bucket.min = Math.min(bucket.min, score)
      bucket.pass += score >= 60 ? 1 : 0
      // 统一优秀标准为分数>=90，且仅统计正常考试
      const course = c
      if (!isMakeupCourse(course) && !isDeferredExam(course)) {
        bucket.excellent += score >= 90 ? 1 : 0
      }
      bucket.squares += score * score
    })
  })

  const result = Object.values(courseMap).map(v => {
    const averageScore = v.count ? v.sum / v.count : 0
    const variance = v.count ? (v.squares / v.count) - averageScore * averageScore : 0
    const standardDeviation = Math.sqrt(Math.max(variance, 0))
    const passRate = v.count ? (v.pass / v.count) * 100 : 0
    const excellentRate = v.count ? (v.excellent / v.count) * 100 : 0

    let difficulty = '中等'
    if (passRate >= 90) difficulty = '简单'
    else if (passRate >= 70) difficulty = '较易'
    else if (passRate >= 50) difficulty = '中等'
    else if (passRate >= 30) difficulty = '较难'
    else difficulty = '困难'

    // 老师字段：如果存在多个老师，展示为"多位老师"；否则展示单一老师
    const teachersArray = Array.from(v.teachers)
    const teacherDisplay = teachersArray.length === 0 ? '未知教师' : (teachersArray.length === 1 ? teachersArray[0] : '多位老师')

    return {
      courseName: v.courseName,
      teacher: teacherDisplay,
      courseCode: Array.from(v.courseCodes).join('、') || '',
      studentCount: v.count,
      averageScore,
      maxScore: v.max === -Infinity ? 0 : v.max,
      minScore: v.min === Infinity ? 0 : v.min,
      passRate,
      excellentRate,
      standardDeviation,
      difficulty,
    }
  })

  return result.sort((a, b) => b.averageScore - a.averageScore)
})

// 高挂科率科目分析数据
// 高挂科率课程：仅统计正常考试（排除补考、缓考等）
const highFailureCourses = computed(() => {
  if (!hasData.value) return []
  
  const courseStats = new Map<string, any>()
  const normalizeName = (name: string) => (name || '')
    .trim()
    .replace(/[（(]?\s*(?:I{1,3}|Ⅰ|Ⅱ|Ⅲ)\s*[)）]?$/i, '')
    .trim()
  const codesByName = new Map<string, Set<string>>()
  
  // 按课程+教师+年级+专业+班级分组统计
  rawStudentData.value.forEach(student => {
    student.courses.forEach(course => {
      if (course.isVoid || course.score === undefined || course.score === null) return
      
      // 根据筛选条件过滤
      const matchGrade = selectedGrade.value === '全部年级' ? true : student.grade === selectedGrade.value
      const matchClass = selectedClass.value ? student.className === selectedClass.value : true
      const matchMajor = selectedMajor.value ? student.major === selectedMajor.value : true
      
      if (!matchGrade || !matchClass || !matchMajor) return

      // 排除非正常考试（补考、重修、重考、缓考/延期）
      if (isMakeupCourse(course)) return
      if (isDeferredExam(course)) return
      
      const normName = normalizeName(course.courseName || '')
      const key = mergeHighFailureCourses.value
        ? `${normName}`
        : `${normName}@@${(course.teacher || '未知教师').trim()}@@${student.grade}@@${student.major}@@${student.className}`
      
      if (!courseStats.has(key)) {
        courseStats.set(key, {
          courseName: normName,
          courseCode: (course.courseCode || ''),
          teacher: course.teacher || '未知教师',
          // 在合并模式下，仍显示所选筛选条件（如果有选择）
          grade: mergeHighFailureCourses.value
            ? (selectedGrade.value === '全部年级' ? undefined : selectedGrade.value)
            : student.grade,
          major: mergeHighFailureCourses.value
            ? (selectedMajor.value ? selectedMajor.value : undefined)
            : student.major,
          className: mergeHighFailureCourses.value
            ? (selectedClass.value ? selectedClass.value : undefined)
            : student.className,
          studentCount: 0,
          failedCount: 0,
          scores: [],
          teachers: new Set<string>()
        })
      }
      
      const stats = courseStats.get(key)
      stats.studentCount++
      stats.scores.push(course.score)
      if (course.score < 60) {
        stats.failedCount++
      }
      // 记录教师集合与课程代码集合（用于合并显示）
      if (course.teacher) stats.teachers.add(course.teacher)
      const code = (course.courseCode || '').trim()
      if (code) {
        const set = codesByName.get(normName) || new Set<string>()
        set.add(code)
        codesByName.set(normName, set)
      }
    })
  })
  
  // 计算挂科率并筛选高挂科率课程
  const highFailureList: any[] = []
  courseStats.forEach(stats => {
    const failureRate = (stats.failedCount / stats.studentCount) * 100
    if (failureRate > 10) { // 挂科率超过10%
      const avgScore = stats.scores.reduce((sum: number, score: number) => sum + score, 0) / stats.scores.length
      const maxScore = Math.max(...stats.scores)
      const minScore = Math.min(...stats.scores)
      
      const codeJoined = Array.from(codesByName.get(stats.courseName) || new Set<string>()).join('、')
      const teacherDisplay = stats.teachers && stats.teachers.size > 1
        ? '多位老师'
        : (stats.teachers && stats.teachers.size === 1 ? Array.from(stats.teachers)[0] : (stats.teacher || '未知教师'))

      highFailureList.push({
        courseName: stats.courseName,
        courseCode: mergeHighFailureCourses.value ? codeJoined : (stats.courseCode || ''),
        teacher: mergeHighFailureCourses.value ? teacherDisplay : (stats.teacher || '未知教师'),
        teacherList: Array.from(stats.teachers || []),
        grade: stats.grade,
        major: stats.major,
        className: stats.className,
        studentCount: stats.studentCount,
        failedCount: stats.failedCount,
        failureRate,
        avgScore,
        maxScore,
        minScore
      })
    }
  })
  
  // 按挂科率降序排序
  return highFailureList.sort((a, b) => b.failureRate - a.failureRate)
})

// 高挂科率科目统计信息
const totalHighFailureStudents = computed(() => {
  return highFailureCourses.value.reduce((sum, course) => sum + course.studentCount, 0)
})

const totalHighFailureCount = computed(() => {
  return highFailureCourses.value.reduce((sum, course) => sum + course.failedCount, 0)
})

const avgHighFailureRate = computed(() => {
  const courses = highFailureCourses.value
  if (courses.length === 0) return 0
  return courses.reduce((sum, course) => sum + course.failureRate, 0) / courses.length
})

// 课程分析已移除（在报告页提供课程报告），此处不再计算
// 是否合并高挂科率同名课程（默认关闭）
const mergeHighFailureCourses = ref(false)

// 方法
// 判断是否为通识课程：
// 1) 课程名包含“通识”；或 2) 课程代码以"TS"、"GEN"等常见前缀开头
const isGeneralCourse = (course: { courseName?: string; courseCode?: string; teacher?: string }) => {
  const name = (course.courseName || '').toLowerCase()
  const code = (course.courseCode || '').toUpperCase()
  if (name.includes('通识')) return true
  if (code.startsWith('TS') || code.startsWith('GEN')) return true
  return false
}

// 判断是否为补考课程：依据考试性质字段或课程名包含关键字
const isMakeupCourse = (course: { courseName?: string; examNature?: string; courseCode?: string }) => {
  const nature = (course.examNature || '').toLowerCase()
  const name = (course.courseName || '').toLowerCase()
  const keywords = ['补考', '重修', '重考']
  if (keywords.some(k => nature.includes(k.toLowerCase()))) return true
  if (keywords.some(k => name.includes(k.toLowerCase()))) return true
  return false
}
// 判断是否为缓考/延期考试：依据考试性质或课程名包含关键字
const isDeferredExam = (course: { courseName?: string; examNature?: string }) => {
  const nature = (course.examNature || '').toLowerCase()
  const name = (course.courseName || '').toLowerCase()
  const keywords = ['缓考', '延期', '延考', '推迟考试']
  if (keywords.some(k => nature.includes(k.toLowerCase()))) return true
  if (keywords.some(k => name.includes(k.toLowerCase()))) return true
  return false
}
const checkDataStatus = () => {
  if (!dataStore.isDataLoaded) {
    ElMessage.warning('暂无数据，请先导入Excel文件')
    router.push('/import')
    return
  }
  
  // 设置默认选择
  if (semesterOptions.value.length > 0) {
    selectedSemester.value = semesterOptions.value[0]
  }
}

const goToImport = () => {
  router.push('/import')
}

// 标签类型验证函数
const validateTagType = (type: string): string => {
  const validTypes = ['success', 'info', 'warning', 'danger']
  return validTypes.includes(type) ? type : 'info'
}




// 标签类型获取函数
const getGPATagType = (gpa: number | undefined | null) => {
  if (gpa == null || isNaN(gpa)) return validateTagType('info')
  if (gpa >= 3.5) return validateTagType('success')
  if (gpa >= 3.0) return validateTagType('info')
  if (gpa >= 2.5) return validateTagType('warning')
  return validateTagType('danger')
}

const getScoreTagType = (score: number | undefined | null) => {
  if (score == null || isNaN(score)) return validateTagType('info')
  if (score >= 90) return validateTagType('success')
  if (score >= 80) return validateTagType('info')
  if (score >= 70) return validateTagType('warning')
  return validateTagType('danger')
}

// 导出功能
const exportSemesterData = () => {
  try {
    const data = semesterSummary.value
    const headers = ['专业', '学生数', '人数(去重)', '人次(考试次数)', '平均GPA', '及格率(%)', '优秀率(%)', '不及格率(%)', '优秀人数', '优秀人次', '不及格人数', '不及格人次', '总学分']
    const rows = data.map(row => [
      row.major,
      row.totalStudents,
      row.uniqueStudentCount,
      row.totalExamCount,
      Number(safeToFixed(row.averageGPA, 2)),
      Number(safeToFixed(row.passRate, 2)),
      Number(safeToFixed(row.excellentRate, 2)),
      Number(safeToFixed(row.failureRate, 2)),
      row.excellentStudentCount,
      row.excellentExamCount,
      row.failedStudentCount,
      row.failedExamCount,
      row.totalCredits
    ])
    exportToExcel([
      { name: '学期成绩汇总', headers, rows }
    ], `学期成绩汇总_${selectedSemester.value || '全部学期'}_${selectedGrade.value || '全部年级'}_${selectedMajor.value || '全部专业'}_${selectedClass.value || '全部班级'}`)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const exportFinalData = () => {
  try {
    const data = finalExamsAnalysis.value
    const headers = ['课程名称', '课程代码', '任课教师', '专业', '学生数', '平均分', '及格率(%)', '优秀率(%)']
    const rows = data
      .filter(row => (showGeneralCourses.value || !isGeneralCourse({ courseName: row.courseName, courseCode: row.courseCode })) && (showMakeupCourses.value || !isMakeupCourse({ courseName: row.courseName })))
      .map(row => [
        row.courseName,
        row.courseCode || '',
        row.teacher || '',
        row.major || '',
        row.studentCount,
        Number(safeToFixed(row.avgScore, 2)),
        Number(safeToFixed(row.passRate, 2)),
        Number(safeToFixed(row.excellentRate, 2))
      ])
    exportToExcel([
      { name: '课程成绩分析', headers, rows }
    ], `课程成绩分析_${selectedGrade.value || '全部年级'}_${selectedMajor.value || '全部专业'}_${selectedClass.value || '全部班级'}`)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const exportTeacherData = () => {
  try {
    const data = teacherAnalysis.value
    const headers = ['教师姓名', '授课数量', '学生总数', '平均分', '及格率(%)', '优秀率(%)', '授课课程']
    const rows = data.map(row => [
      row.teacher,
      row.courseCount,
      row.studentCount,
      Number(safeToFixed(row.avgScore, 2)),
      Number(safeToFixed(row.passRate, 2)),
      Number(safeToFixed(row.excellentRate, 2)),
      row.courses.join(';')
    ])
    exportToExcel([
      { name: '教师教学分析', headers, rows }
    ], `教师教学分析_${selectedGrade.value || '全部年级'}_${selectedMajor.value || '全部专业'}_${selectedClass.value || '全部班级'}`)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}


const exportHighFailureData = () => {
  try {
    const data = highFailureCourses.value
    const headers = ['课程名称', '课程代码', '任课教师', '年级', '专业', '班级', '学生数', '不及格人数', '挂科率(%)', '平均分', '最高分', '最低分']
    const rows = data.map(row => [
      row.courseName,
      row.courseCode,
      row.teacher,
      row.grade,
      row.major,
      row.className,
      row.studentCount,
      row.failedCount,
      Number(safeToFixed(row.failureRate, 2)),
      Number(safeToFixed(row.avgScore, 2)),
      row.maxScore,
      row.minScore
    ])
    exportToExcel([
      { name: '高挂科率科目分析', headers, rows }
    ], `高挂科率科目分析_${selectedGrade.value || '全部年级'}_${selectedMajor.value || '全部专业'}_${selectedClass.value || '全部班级'}`)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 各年级各专业成绩分析导出
const exportGradeMajorData = () => {
  try {
    const data = gradeAndMajorAnalysis.value
    const headers = ['年级', '专业', '平均GPA', '平均分', '及格率(%)', '优秀率(%)', '不及格率(%)', '优势课程', '薄弱课程']
    const rows = data.map(row => [
      row.grade,
      row.major,
      Number(safeToFixed(row.averageGPA, 2)),
      Number(safeToFixed(row.averageScore, 2)),
      Number(safeToFixed(row.passRate, 2)),
      Number(safeToFixed(row.excellentRate, 2)),
      Number(safeToFixed(row.failureRate, 2)),
      (row.topCourses || []).join('、'),
      (row.weakCourses || []).join('、')
    ])

    exportToExcel([
      { name: '各年级各专业成绩分析', headers, rows }
    ], `各年级各专业成绩分析_${selectedGrade.value || '全部年级'}_${selectedMajor.value || '全部专业'}_${selectedClass.value || '全部班级'}`)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 课程详情
// 统一课程名标准化（去除结尾罗马数字及可选括号）
const normalizeCourseName = (name: string) => {
  return (name || '')
    .trim()
    .replace(/[（(]?\s*(?:I{1,3}|Ⅰ|Ⅱ|Ⅲ)\s*[)）]?$/i, '')
    .trim()
}

const viewCourseDetail = (course: any) => {
  // 统一字段：平均分使用 averageScore，兼容来源于期末分析的 avgScore
  selectedCourse.value = {
    ...course,
    teacher: (typeof course.teacher === 'string' && course.teacher.trim().length > 0) ? course.teacher.trim() : '未知教师',
    averageScore: typeof course.averageScore === 'number' && !isNaN(course.averageScore) ? course.averageScore : (typeof course.avgScore === 'number' ? course.avgScore : 0)
  }
  // 若多位老师且源行提供teacherList，保留以供tooltip显示
  if (Array.isArray((course as any).teacherList)) {
    (selectedCourse.value as any).teacherList = (course as any).teacherList
  }
  
  // 调试：查看传入课程对象与平均分映射结果
  console.log('[CourseDetail] incoming course:', course)
  console.log('[CourseDetail] mapped averageScore:', selectedCourse.value.averageScore)
  
  // 分析优秀学生和不及格学生
  const courseStudents: any[] = []
  const excellentStudentsList: any[] = []
  const failingStudentsList: any[] = []
  
  // 使用与表格一致的筛选后的学生+课程集合
  getFilteredStudentsForFinal().forEach(student => {
    // 若当前行包含专业信息，则进一步按该专业限制学生范围
    if (course.major && student.major !== course.major) return
    student.courses.forEach(courseItem => {
      const courseNameMatch = normalizeCourseName(courseItem.courseName || '') === normalizeCourseName(course.courseName || '')
      const selectedTeacher = (typeof course.teacher === 'string' && course.teacher.trim().length > 0) ? course.teacher.trim() : '未知教师'
      const teacherMatch = (selectedTeacher === '未知教师' || selectedTeacher === '多位老师')
        ? true
        : ((typeof courseItem.teacher === 'string' && courseItem.teacher.trim().length > 0 ? courseItem.teacher.trim() : '未知教师') === selectedTeacher)
      // 详情页统计与高挂科率表保持一致：排除补考与缓考/延期考试
      if (isMakeupCourse(courseItem) || isDeferredExam(courseItem)) {
        return
      }
      if (!courseItem.isVoid && courseNameMatch && teacherMatch && courseItem.normalizedScore !== undefined) {
        
        const studentInfo = {
          studentId: student.studentId,
          studentName: student.studentName,
          className: student.className,
          major: student.major,
          grade: student.grade,
          score: courseItem.normalizedScore,
          gpa: courseItem.gpa,
          isPassed: courseItem.isPassed
        }
        
        courseStudents.push(studentInfo)
        // 优秀学生按统一标准 >= 90（课程预过滤已根据开关处理通识/补考）
        if (courseItem.normalizedScore >= 90) {
          excellentStudentsList.push(studentInfo)
        }
        
        if (!courseItem.isPassed) {
          failingStudentsList.push(studentInfo)
        }
      }
    })
  })
  
  // 如果平均分为0或无效，使用收集到的学生成绩计算回退平均分
  if (!selectedCourse.value.averageScore || isNaN(selectedCourse.value.averageScore)) {
    const fallbackAvg = courseStudents.length > 0 ? (courseStudents.reduce((sum, s) => sum + (s.score || 0), 0) / courseStudents.length) : 0
    selectedCourse.value.averageScore = fallbackAvg
    console.log('[CourseDetail] fallback averageScore:', fallbackAvg)
  }
  
  // 排序：优秀学生按分数降序，不及格学生按分数升序
  excellentStudents.value = excellentStudentsList.sort((a, b) => b.score - a.score)
  failingStudents.value = failingStudentsList.sort((a, b) => a.score - b.score)
  
  // 与表格保持一致：如果来源行包含已统计的学生数，则优先使用
  const total = typeof course.studentCount === 'number' && course.studentCount > 0
    ? course.studentCount
    : courseStudents.length
  const excellentCount = excellentStudentsList.length
  const failCount = failingStudentsList.length
  // 及格率优先使用 isPassed，其次按分数>=60
  const passCountByScore = courseStudents.filter(s => (typeof s.score === 'number' ? s.score >= 60 : false) || s.isPassed).length
  const passCount = Math.max(total - failCount, passCountByScore)

  selectedCourse.value.studentCount = total
  selectedCourse.value.passRate = total ? (passCount / total) * 100 : 0
  selectedCourse.value.excellentRate = total ? (excellentCount / total) * 100 : 0
  
  showCourseDetail.value = true
  nextTick(() => {
    initCourseDetailChart()
  })
}

const handleCloseDetail = () => {
  showCourseDetail.value = false
  selectedCourse.value = null
  excellentStudents.value = []
  failingStudents.value = []
}

// 图表初始化
const initGPAChart = () => {
  const el = gpaChartRef.value
  if (!el || !hasData.value) return
  if (!isContainerReady(el)) {
    setTimeout(initGPAChart, 100)
    return
  }

  // 清理旧的图表实例
  if (gpaChart) {
    gpaChart.dispose()
  }
  
  gpaChart = echarts.init(el)
  
  // 计算真实GPA分布数据
  const gpaRanges = ['0-1.0', '1.0-2.0', '2.0-2.5', '2.5-3.0', '3.0-3.5', '3.5-4.0']
  const gpaDistribution = gpaRanges.map(range => {
    const [min, max] = range.split('-').map(Number)
    return rawStudentData.value.filter(student => {
      const gpa = student.gpa
      return gpa >= min && gpa < (max === 4.0 ? 4.1 : max)
    }).length
  })

  const option = {
    title: {
      text: 'GPA分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'GPA分布',
        type: 'pie',
        radius: '50%',
        data: gpaRanges.map((range, index) => ({
          value: gpaDistribution[index],
          name: range
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  gpaChart.setOption(option)
}

// 成绩分布图已随课程分析移除

const initCourseDetailChart = () => {
  const el = courseDetailChartRef.value
  if (!el || !selectedCourse.value) return
  if (!isContainerReady(el)) {
    setTimeout(initCourseDetailChart, 100)
    return
  }

  // 清理旧的图表实例
  if (courseDetailChart) {
    courseDetailChart.dispose()
  }
  
  courseDetailChart = echarts.init(courseDetailChartRef.value)
  
  // 计算真实课程详细成绩分布数据
  const scoreRanges = ['0-60', '60-70', '70-80', '80-90', '90-100']
  const courseScores: number[] = []
  
  // 收集该课程的所有成绩（基于当前筛选与显示开关）
  getFilteredStudentsForFinal().forEach(student => {
    // 若详情行包含专业信息，则限制学生范围
    if (selectedCourse.value?.major && student.major !== selectedCourse.value.major) return
    student.courses.forEach(course => {
      const nameMatch = normalizeCourseName(course.courseName || '') === normalizeCourseName(selectedCourse.value.courseName || '')
      const selectedTeacher = (typeof selectedCourse.value.teacher === 'string' && selectedCourse.value.teacher.trim().length > 0) ? selectedCourse.value.teacher.trim() : '未知教师'
      const teacherMatch = (selectedTeacher === '未知教师' || selectedTeacher === '多位老师')
        ? true
        : ((typeof course.teacher === 'string' && course.teacher.trim().length > 0 ? course.teacher.trim() : '未知教师') === selectedTeacher)
      if (!course.isVoid && nameMatch && teacherMatch && course.normalizedScore !== undefined) {
        courseScores.push(course.normalizedScore)
      }
    })
  })
  
  const distribution = scoreRanges.map(range => {
    const [min, max] = range.split('-').map(Number)
    return courseScores.filter(score => {
      return score >= min && score < (max === 100 ? 101 : max)
    }).length
  })

  const option = {
    title: {
      text: `${selectedCourse.value.courseName} 成绩分布`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: scoreRanges
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: distribution,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ffd666' },
            { offset: 0.5, color: '#ffc53d' },
            { offset: 1, color: '#faad14' }
          ])
        }
      }
    ]
  }

  courseDetailChart.setOption(option)
}

// 生命周期
onMounted(() => {
  checkDataStatus()
  const handleResize = () => {
    gpaChart?.resize()
    courseDetailChart?.resize()
  }
  window.addEventListener('resize', handleResize)

  nextTick(() => {
    if (hasData.value) {
      if (activeTab.value === 'grade') initGPAChart()
    }
  })

  // 标签切换时初始化对应图表
  watch(activeTab, async (tab) => {
    await nextTick()
    if (tab === 'grade') setTimeout(initGPAChart, 0)
  })

  // 课程详情弹窗打开时初始化图表
  watch(showCourseDetail, async (open) => {
    if (open) {
      await nextTick()
      setTimeout(initCourseDetailChart, 0)
    } else if (courseDetailChart) {
      courseDetailChart.dispose()
      courseDetailChart = null
    }
  })

  // 当筛选条件或显示开关变化时，若详情弹窗打开则同步重算并刷新
  watch([selectedGrade, selectedClass, selectedMajor, showGeneralCourses, showMakeupCourses], () => {
    if (showCourseDetail.value && selectedCourse.value) {
      // 仅使用核心字段触发重算，保持弹窗打开
      const payload = {
        courseName: selectedCourse.value.courseName,
        courseCode: selectedCourse.value.courseCode,
        teacher: selectedCourse.value.teacher,
        major: selectedCourse.value.major,
        avgScore: selectedCourse.value.averageScore
      }
      viewCourseDetail(payload)
      setTimeout(initCourseDetailChart, 0)
    }
  })
})

onBeforeUnmount(() => {
  // 清理所有图表实例，防止内存泄漏和vnode错误
  if (gpaChart) {
    gpaChart.dispose()
    gpaChart = null
  }
  if (courseDetailChart) {
    courseDetailChart.dispose()
    courseDetailChart = null
  }
  // 移除窗口resize监听
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.analysis-page {
  min-height: calc(100vh - 60px);
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.analysis-tabs :deep(.el-tabs__header) {
  background: white;
  border-radius: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
}

.analysis-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.analysis-tabs :deep(.el-tabs__item) {
  font-weight: 500;
}

.analysis-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
}
</style>