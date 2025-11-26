import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { Donut } from "../components/charts/Donut";
import { AreaSpark } from "../components/charts/AreaSpark";
import { mockAvatars } from "../mocks/db";
import { WorkspaceProvider } from "../features/workspace/WorkspaceContext";

// ------------------ Types ------------------
type TimeRange = "today" | "7d" | "30d";

type Metric = {
  id: string;
  label: string;
  value: string;
  helper: string;
};

type QuickStat = {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: "positive" | "negative";
};

type TaskItem = {
  id: string;
  title: string;
  owner: string;
  due: string;
};

type CollabCalendarEvent = {
  id: string;
  day: number;
  label: string;
  channel: string;
  accent: string;
  badgeClass: string;
};

type CollabBoardItem = {
  id: string;
  utn: string;
  title: string;
  owner: string;
  status: string;
  statusClass: string;
  location: string;
  due: string;
  channel: string;
};

type CollabActionItem = {
  id: string;
  title: string;
  owner: string;
  due: string;
  channel: string;
  badgeClass: string;
};

type CollabTeamStream = {
  id: string;
  title: string;
  focus: string;
  owner: string;
  progress: number;
  progressClass: string;
  channel: string;
};

type CollabQuickLink = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  badgeClass: string;
};

type KnowledgeResource = {
  id: string;
  title: string;
  detail: string;
};

type SupportShortcut = {
  id: string;
  title: string;
  detail: string;
};

type WorkflowAssignment = {
  id: string;
  utn: string;
  title: string;
  tech: string;
  stage: string;
  sla: string;
};

type ReportQueueItem = {
  id: string;
  utn: string;
  subject: string;
  owner: string;
  stage: string;
  due: string;
  channel: string;
  completeness: number;
  attachments: number;
  sensitivity: string;
};

// ------------------ Data ------------------
const todayMetrics: Metric[] = [
  { id: "total", label: "کل گردش امروز", value: "۹۴ پرونده", helper: "همه فعالیت‌ها" },
  { id: "urgent", label: "ارجاع اضطراری", value: "۱۸", helper: "نیازمند اقدام فوری" },
  { id: "active", label: "در حال اقدام", value: "۳۲", helper: "پرونده‌های باز" },
  { id: "closed", label: "بسته شده", value: "۴۴", helper: "تحویل و نهایی شده" },
];

const weekMetrics: Metric[] = [
  { id: "total", label: "کل گردش ۷ روز اخیر", value: "۵۴۰ پرونده", helper: "همه فعالیت‌ها" },
  { id: "urgent", label: "ارجاع اضطراری", value: "۷۴", helper: "نیازمند اقدام فوری" },
  { id: "active", label: "در حال اقدام", value: "۱۵۸", helper: "میانگین روزانه ۲۲" },
  { id: "closed", label: "بسته شده", value: "۳۰۸", helper: "بسته شده در ۷ روز" },
];

const monthMetrics: Metric[] = [
  { id: "total", label: "کل گردش ۳۰ روز اخیر", value: "۲۲۴۰ پرونده", helper: "همه فعالیت‌ها" },
  { id: "urgent", label: "ارجاع اضطراری", value: "۲۹۶", helper: "میانگین روزانه ۱۰" },
  { id: "active", label: "در حال اقدام", value: "۵۹۰", helper: "پرونده‌های باز فعلی" },
  { id: "closed", label: "بسته شده", value: "۱۳۵۴", helper: "بسته شده در ۳۰ روز" },
];

const metricsByRange: Record<TimeRange, Metric[]> = {
  today: todayMetrics,
  "7d": weekMetrics,
  "30d": monthMetrics,
};

const quickStats: QuickStat[] = [
  { id: "sla", label: "پوشش SLA امروز", value: "۹۲٪", change: "+۴٪", tone: "positive" },
  { id: "handover", label: "تحویل‌های موفق", value: "۱۲", change: "+۲", tone: "positive" },
  { id: "alerts", label: "هشدارهای فعال", value: "۶", change: "-۱", tone: "positive" },
  { id: "backlog", label: "پرونده‌های معوق", value: "۸", change: "+۳", tone: "negative" },
];

const donutToday = [
  { label: "بازرسی میدانی", value: 32, color: "#2563eb" },
  { label: "تحلیل آزمایشگاهی", value: 18, color: "#0ea5e9" },
  { label: "مستندسازی", value: 26, color: "#f97316" },
  { label: "سایر فعالیت‌ها", value: 18, color: "#10b981" },
];

const donutWeek = [
  { label: "بازرسی میدانی", value: 180, color: "#2563eb" },
  { label: "تحلیل آزمایشگاهی", value: 110, color: "#0ea5e9" },
  { label: "مستندسازی", value: 130, color: "#f97316" },
  { label: "سایر فعالیت‌ها", value: 120, color: "#10b981" },
];

const donutMonth = [
  { label: "بازرسی میدانی", value: 720, color: "#2563eb" },
  { label: "تحلیل آزمایشگاهی", value: 430, color: "#0ea5e9" },
  { label: "مستندسازی", value: 520, color: "#f97316" },
  { label: "سایر فعالیت‌ها", value: 570, color: "#10b981" },
];

const donutByRange: Record<TimeRange, typeof donutToday> = {
  today: donutToday,
  "7d": donutWeek,
  "30d": donutMonth,
};

const sparkToday = [42, 50, 64, 58, 71, 69, 82, 88, 93, 90, 97, 103];
const sparkWeek = [380, 410, 430, 460, 480, 500, 540, 560, 590, 610, 640, 670];
const sparkMonth = [1200, 1400, 1500, 1600, 1700, 1800, 1900, 2050, 2150, 2200, 2300, 2400];

const sparkByRange: Record<TimeRange, number[]> = {
  today: sparkToday,
  "7d": sparkWeek,
  "30d": sparkMonth,
};

const priorityTasks: TaskItem[] = [
  { id: "alert-1", title: "پروژه بدنه UTN-2045 منتظر تایید طراحی است", owner: "سارا رحیمی", due: "امروز · ۱۵:۰۰" },
  { id: "alert-2", title: "ارسال خلاصه بازرسی برای یگان ۳", owner: "علی محمدی", due: "فردا · ۱۰:۳۰" },
  { id: "alert-3", title: "آماده‌سازی گزارش برای تماس مدیران", owner: "فاطمه کریمی", due: "جمعه · ۰۹:۰۰" },
];

const initialCollabCalendarEvents: CollabCalendarEvent[] = [
  { id: "cal-23-1", day: 23, label: "واکشی کابل بدنه", channel: "میدانی", accent: "text-emerald-700", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "cal-23-2", day: 23, label: "حضور QA مشترک", channel: "کنترل کیفیت", accent: "text-blue-700", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "cal-24-1", day: 24, label: "تحویل بردهای الکتریک", channel: "کارگاه", accent: "text-indigo-700", badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "cal-24-2", day: 24, label: "هم‌ترازی سازه", channel: "QA", accent: "text-slate-700", badgeClass: "bg-slate-50 text-slate-700 border-slate-200" },
  { id: "cal-25-1", day: 25, label: "جلسه آنلاین مدیران", channel: "مدیریت", accent: "text-amber-700", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
];

const initialCollabBoardItems: CollabBoardItem[] = [
  { id: "board-1", utn: "UTN-2045", title: "بازرسی لرزش بدنه", owner: "ندا شریفی", status: "در جریان", statusClass: "bg-blue-50 text-blue-700 border-blue-200", location: "اسکله شهید بهشتی", due: "امروز · ۱۴:۰۰", channel: "میدانی" },
  { id: "board-2", utn: "UTN-1980", title: "تحلیل نشتی روغن", owner: "محمد رضوی", status: "در انتظار QA", statusClass: "bg-amber-50 text-amber-700 border-amber-200", location: "کارگاه جنوبی", due: "امروز · ۱۷:۰۰", channel: "QA" },
  { id: "board-3", utn: "UTN-2101", title: "بارگیری بردهای الکتریک", owner: "مهدی سلیمانی", status: "آماده ارسال", statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200", location: "کارگاه مرکزی", due: "فردا · ۰۹:۳۰", channel: "کارگاه" },
  { id: "board-4", utn: "UTN-1766", title: "تکمیل مستندات سیستم عمومی", owner: "فاطمه کریمی", status: "نیازمند اطلاعات", statusClass: "bg-rose-50 text-rose-600 border-rose-200", location: "اتاق داده ایمن", due: "فردا · ۱۲:۰۰", channel: "مستندسازی" },
];

const initialCollabActionItems: CollabActionItem[] = [
  { id: "action-1", title: "ارسال گزارش لرزش به QA", owner: "ندا شریفی", due: "۲ ساعت دیگر", channel: "QA", badgeClass: "bg-rose-50 text-rose-600 border-rose-100" },
  { id: "action-2", title: "هم‌رسانی نقشه‌های اصلاحی", owner: "محمد رضوی", due: "پیش از پایان شیفت", channel: "کارگاه", badgeClass: "bg-amber-50 text-amber-700 border-amber-100" },
  { id: "action-3", title: "به‌روزرسانی وضعیت در برد مدیران", owner: "مهدی سلیمانی", due: "تا ساعت ۲۰", channel: "داشبورد مدیران", badgeClass: "bg-blue-50 text-blue-700 border-blue-100" },
];

const collabTeamStreams: CollabTeamStream[] = [
  { id: "stream-body", title: "هماهنگی بدنه", focus: "کابل‌کشی + تست لرزش", owner: "سارا رحیمی", progress: 72, progressClass: "bg-emerald-400", channel: "میدانی" },
  { id: "stream-electric", title: "شبکه الکتریک", focus: "بردهای کنترل و نرم‌افزار", owner: "مهدی سلیمانی", progress: 58, progressClass: "bg-indigo-400", channel: "کارگاه" },
  { id: "stream-field", title: "میدانی و بهره‌بردار", focus: "جلسات حضوری + هماهنگی QA", owner: "ندا شریفی", progress: 81, progressClass: "bg-blue-400", channel: "کنترل کیفیت" },
];

const collabQuickLinks: CollabQuickLink[] = [
  { id: "quick-1", title: "دعوت از QA برای تحویل مشترک", detail: "ارسال لینک جلسه آنلاین + یادآور SMS", badge: "QA", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { id: "quick-2", title: "اشتراک نقشه اصلاحی بدنه", detail: "اتاق داده ایمن · PDF + DWG", badge: "Data Room", badgeClass: "bg-blue-50 text-blue-700 border-blue-100" },
  { id: "quick-3", title: "ارسال وضعیت برای مدیر پروژه", detail: "داشبورد مدیران · گزارش لحظه‌ای", badge: "مدیریت", badgeClass: "bg-amber-50 text-amber-700 border-amber-100" },
];

const knowledgeBaseResources: KnowledgeResource[] = [
  { id: "kb-root-cause", title: "راهنمای تحلیل ریشه‌ای ارتعاش", detail: "چک‌لیست ۱۲ مرحله‌ای برای یافتن سریع منشأ ایراد" },
  { id: "kb-report-kit", title: "الگوی گزارش مدیران", detail: "نسخه آماده ارائه با نمودارهای مقایسه‌ای" },
  { id: "kb-field-validation", title: "بسته معتبرسازی میدانی", detail: "استانداردهای پذیرش برای تیم QA" },
];

const supportShortcuts: SupportShortcut[] = [
  { id: "ticket", title: "ثبت تیکت", detail: "برای هماهنگی با واحد پشتیبانی" },
  { id: "chat", title: "چت با مهندس آماده‌باش", detail: "میانگین پاسخ‌گویی ۶ دقیقه" },
  { id: "meeting", title: "رزرو جلسه هم‌آهنگی", detail: "انتخاب بازه ۳۰ دقیقه‌ای" },
  { id: "secure-room", title: "اتاق داده ایمن", detail: "آپلود نقشه‌ها و مدارک حجیم" },
];

const initialWorkflowAssignments: WorkflowAssignment[] = [
  { id: "wf-1", utn: "UTN-2045", title: "بدنه / لرزش غیرعادی", tech: "سارا رحیمی", stage: "بازرسی میدانی", sla: "۲ ساعت" },
  { id: "wf-2", utn: "UTN-1980", title: "ماشین‌آلات / نشت روغن", tech: "محمد رضوی", stage: "در انتظار تحویل", sla: "تا پایان امروز" },
  { id: "wf-3", utn: "UTN-2101", title: "الکتریک / قطع مقطعی", tech: "مهدی سلیمانی", stage: "تحلیل آزمایشگاهی", sla: "فردا صبح" },
  { id: "wf-4", utn: "UTN-1766", title: "سیستم عمومی / به‌روزرسانی مدارک", tech: "فاطمه کریمی", stage: "مستندسازی", sla: "در حال اقدام" },
];

const initialReportQueue: ReportQueueItem[] = [
  { id: "report-1", utn: "UTN-2045", subject: "ممیزی لرزش بدنه · نسخه ۳", owner: "ندا شریفی", stage: "در انتظار تایید", due: "امروز · ۱۸:۰۰", channel: "QA", completeness: 78, attachments: 6, sensitivity: "محرمانه" },
  { id: "report-2", utn: "UTN-1980", subject: "تحلیل نشتی روغن و CAPA", owner: "محمد رضوی", stage: "در حال تحلیل", due: "امروز · ۲۱:۰۰", channel: "کارگاه", completeness: 52, attachments: 3, sensitivity: "عادی" },
  { id: "report-3", utn: "UTN-2101", subject: "خلاصه مدیریتی شبکه الکتریک", owner: "مهدی سلیمانی", stage: "آماده انتشار", due: "فردا · ۱۰:۰۰", channel: "مستندسازی", completeness: 91, attachments: 4, sensitivity: "عادی" },
  { id: "report-4", utn: "UTN-1766", subject: "به‌روزرسانی مستندات عمومی", owner: "فاطمه کریمی", stage: "ارسال شد", due: "دیروز · ۱۶:۰۰", channel: "بدنه", completeness: 100, attachments: 8, sensitivity: "محرمانه" },
];

// ------------------ Helpers ------------------
const rangeLabels: Record<TimeRange, string> = {
  today: "امروز",
  "7d": "۷ روز اخیر",
  "30d": "۳۰ روز اخیر",
};

const colorTone = (tone: QuickStat["tone"]) =>
  tone === "positive" ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50";

// ------------------ View ------------------
function TechnicianDashboardView() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [calendarValue, setCalendarValue] = useState<DateObject | null>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );

  const metrics = metricsByRange[timeRange];
  const donutData = donutByRange[timeRange];
  const sparkData = sparkByRange[timeRange];

  const selectedDay = calendarValue?.day;
  const dayEvents = useMemo(
    () =>
      initialCollabCalendarEvents.filter((event) =>
        selectedDay ? event.day === selectedDay : true
      ),
    [selectedDay]
  );

  const availableTechnicians = mockAvatars.slice(0, 5);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 text-right">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4 flex-row-reverse">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">درگاه کارشناسان</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">داشبورد عملیات میدانی</h1>
            <p className="text-gray-600 mt-1">
              تمام پرونده‌های در جریان، برنامه‌ریزی تیم فنی و گزارش‌های آماده انتشار را در یک نما ببینید.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <Button
              variant="ghost"
              className="px-4 py-2 text-sm text-gray-700"
              onClick={() => navigate("/" + "workspace")}
            >
              <Icon name="layout" size={16} className="ml-2" />
              بازگشت به مرور پروژه‌ها
            </Button>
            <Button variant="primary" className="px-5 py-2 text-sm">
              <Icon name="calendar" size={16} className="ml-2" />
              رزرو ماموریت میدانی
            </Button>
          </div>
        </header>

        {/* Top metrics */}
        <Card className="p-5 text-right">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 flex-row-reverse">
            <div className="flex items-center gap-2 flex-row-reverse">
              {(Object.keys(rangeLabels) as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "primary" : "ghost"}
                  className={`px-3 py-1 text-sm ${timeRange === range ? "" : "text-gray-700"}`}
                  onClick={() => setTimeRange(range)}
                >
                  {rangeLabels[range]}
                </Button>
              ))}
            </div>
            <div className="text-sm text-gray-500">نمای کلی عملکرد تیم</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((item) => (
              <div key={item.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500">{item.label}</p>
                <div className="mt-2 flex items-baseline justify-end gap-2">
                  <span className="text-2xl font-semibold text-gray-900">{item.value}</span>
                  <span className="text-xs text-gray-500">{item.helper}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="col-span-2 p-4 border border-gray-100 rounded-xl bg-white">
              <div className="flex items-center justify-between mb-3 flex-row-reverse">
                <p className="font-medium text-gray-800">حجم فعالیت</p>
                <span className="text-sm text-gray-500">روند {rangeLabels[timeRange]}</span>
              </div>
              <AreaSpark data={sparkData} height={120} color="#2563eb" backgroundColor="#f8fafc" />
            </div>
            <div className="p-4 border border-gray-100 rounded-xl bg-white">
              <div className="flex items-center justify-between mb-3 flex-row-reverse">
                <p className="font-medium text-gray-800">توزیع فعالیت</p>
                <span className="text-sm text-gray-500">{rangeLabels[timeRange]}</span>
              </div>
              <div className="flex items-center justify-center">
                <Donut data={donutData} size={160} showLegend={false} />
              </div>
              <div className="mt-3 space-y-2">
                {donutData.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm flex-row-reverse">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-gray-900 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Secondary stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <Card key={stat.id} className="p-4 border border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-2 flex-row-reverse">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span className={`text-xs px-2 py-1 rounded-lg border ${colorTone(stat.tone)}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 text-left">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Tasks & calendar */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 bg-white border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4 flex-row-reverse">
              <h2 className="text-lg font-semibold text-gray-900">کارهای اولویت‌دار</h2>
              <Button variant="ghost" className="text-sm text-gray-700">
                <Icon name="plus" size={16} className="ml-2" />
                افزودن
              </Button>
            </div>
            <div className="space-y-3">
              {priorityTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between gap-3 flex-row-reverse"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      مالک: {task.owner} · {task.due}
                    </p>
                  </div>
                  <Button variant="ghost" className="text-sm text-gray-700">
                    <Icon name="check" size={16} className="ml-1" />
                    تکمیل
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-100">
            <div className="flex items-center justify-between mb-3 flex-row-reverse">
              <h2 className="text-lg font-semibold text-gray-900">تقویم هماهنگی</h2>
              <span className="text-sm text-gray-500">بازه هفتگی</span>
            </div>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={calendarValue as any}
              onChange={(value) => setCalendarValue(value as DateObject)}
              className="w-full"
              containerClassName="w-full"
              inputClass="w-full rounded-xl border border-gray-200 px-3 py-2 text-right"
            />
            <div className="mt-4 space-y-2">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between flex-row-reverse"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900 font-medium">{event.label}</p>
                    <p className="text-xs text-gray-500">کانال: {event.channel}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg border ${event.badgeClass}`}>{`روز ${event.day}`}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Collaboration */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 border border-gray-100 bg-white lg:col-span-2">
            <div className="flex items-center justify-between mb-4 flex-row-reverse">
              <h2 className="text-lg font-semibold text-gray-900">برد هماهنگی تیمی</h2>
              <Button variant="ghost" className="text-sm text-gray-700">
                <Icon name="arrow-left" size={16} className="ml-2" />
                مشاهده همه
              </Button>
            </div>
            <div className="space-y-3">
              {initialCollabBoardItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-700">
                        {item.utn}
                      </span>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg border ${item.statusClass}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 gap-2 flex-row-reverse">
                    <span>مالک: {item.owner}</span>
                    <span>محل: {item.location}</span>
                    <span>موعد: {item.due}</span>
                    <span className="text-gray-500">کانال: {item.channel}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5 border border-gray-100 bg-white">
              <h3 className="text-base font-semibold text-gray-900 mb-3">اقدامات فوری</h3>
              <div className="space-y-2">
                {initialCollabActionItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between flex-row-reverse"
                  >
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900 font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">مسئول: {item.owner}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg border ${item.badgeClass}`}>{item.due}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 border border-gray-100 bg-white">
              <h3 className="text-base font-semibold text-gray-900 mb-3">جریان‌های تیمی</h3>
              <div className="space-y-3">
                {collabTeamStreams.map((stream) => (
                  <div key={stream.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-gray-700 flex-row-reverse">
                      <span className="font-medium text-gray-900">{stream.title}</span>
                      <span className="text-xs text-gray-500">{stream.owner}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-left">{stream.focus}</p>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className={`h-full rounded-full ${stream.progressClass}`}
                        style={{ width: `${stream.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Quick links & team */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 border border-gray-100 bg-white lg:col-span-2">
            <div className="flex items-center justify-between mb-4 flex-row-reverse">
              <h2 className="text-lg font-semibold text-gray-900">میانبرهای همکاری</h2>
              <span className="text-sm text-gray-500">ارسال سریع فایل و جلسه</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {collabQuickLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2"
                >
                  <div className="flex items-center justify-between flex-row-reverse">
                    <p className="font-semibold text-gray-900">{link.title}</p>
                    <span className={`text-xs px-2 py-1 rounded-lg border ${link.badgeClass}`}>
                      {link.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{link.detail}</p>
                  <Button variant="ghost" className="text-sm text-gray-700">
                    <Icon name="arrow-left" size={16} className="ml-2" />
                    شروع
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3 flex-row-reverse">
              <h3 className="text-base font-semibold text-gray-900">حضور شیفت</h3>
              <span className="text-xs text-gray-500">۵ نفر آنلاین</span>
            </div>
            <div className="space-y-3">
              {availableTechnicians.map((tech) => (
                <div
                  key={tech.email}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 flex-row-reverse"
                >
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden" aria-hidden>
                      {tech.imageUrl ? (
                        <img src={tech.imageUrl} alt={tech.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 font-semibold">
                          {tech.initials || tech.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tech.name}</p>
                      <p className="text-xs text-gray-500">{tech.role || "کارشناس فنی"}</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1">
                    آماده
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Workflow & Reports */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5 border border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3 flex-row-reverse">
              <h2 className="text-lg font-semibold text-gray-900">ارجاعات در جریان</h2>
              <span className="text-sm text-gray-500">SLA زنده</span>
            </div>
            <div className="space-y-2">
              {initialWorkflowAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-2 flex-row-reverse"
                >
                  <div className="flex items-center gap-2 flex-row-reverse text-sm text-gray-900 font-medium">
                    <span className="px-2 py-1 rounded-lg border border-gray-200 text-xs">{assignment.utn}</span>
                    {assignment.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 flex-row-reverse">
                    <span>مسئول: {assignment.tech}</span>
                    <span className="text-gray-500">مرحله: {assignment.stage}</span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1">
                      {assignment.sla}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3 flex-row-reverse">
              <h2 className="text-lg font-semibold text-gray-900">صف گزارش‌ها</h2>
              <span className="text-sm text-gray-500">آماده انتشار</span>
            </div>
            <div className="space-y-2">
              {initialReportQueue.map((report) => (
                <div
                  key={report.id}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50 space-y-2"
                >
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="px-2 py-1 rounded-lg border border-gray-200 text-xs">{report.utn}</span>
                      <p className="font-medium text-gray-900">{report.subject}</p>
                    </div>
                    <span className="text-xs text-gray-500">{report.due}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 flex-row-reverse">
                    <span>مالک: {report.owner}</span>
                    <span>مرحله: {report.stage}</span>
                    <span>کانال: {report.channel}</span>
                    <span className="px-2 py-1 rounded-lg border border-gray-200">{report.sensitivity}</span>
                    <span className="text-emerald-700">{report.completeness}% تکمیل</span>
                    <span className="text-gray-500">پیوست: {report.attachments}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Knowledge & Support */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5 border border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3 flex-row-reverse">
              <h2 className="text-lg font-semibold text-gray-900">منابع دانش</h2>
              <span className="text-sm text-gray-500">به‌روز شده</span>
            </div>
            <div className="space-y-3">
              {knowledgeBaseResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between flex-row-reverse"
                >
                  <div>
                    <p className="font-medium text-gray-900">{resource.title}</p>
                    <p className="text-sm text-gray-600">{resource.detail}</p>
                  </div>
                  <Button variant="ghost" className="text-sm text-gray-700">
                    <Icon name="download" size={16} className="ml-2" />
                    باز کردن
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3 flex-row-reverse">
              <h2 className="text-lg font-semibold text-gray-900">حمایت سریع</h2>
              <span className="text-sm text-gray-500">کانال‌های تیم فنی</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {supportShortcuts.map((shortcut) => (
                <button
                  key={shortcut.id}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-right hover:border-gray-200 transition"
                >
                  <p className="font-medium text-gray-900">{shortcut.title}</p>
                  <p className="text-sm text-gray-600">{shortcut.detail}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export function TechnicianDashboard() {
  return (
    <WorkspaceProvider>
      <TechnicianDashboardView />
    </WorkspaceProvider>
  );
}

export function TechnicianCalendar() {
  return <TechnicianDashboard />;
}

export default TechnicianDashboard;
