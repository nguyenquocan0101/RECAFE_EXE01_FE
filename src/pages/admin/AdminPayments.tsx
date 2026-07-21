import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import {
    exportAdminPayments,
    getAdminPaymentById,
    getAdminPaymentSummary,
    getAdminPayments,
    type AdminPayment,
    type AdminPaymentMethod,
    type AdminPaymentPage,
    type AdminPaymentQuery,
    type AdminPaymentSummary,
    type AdminPaymentStatus
} from '@/services/api/payments';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<{ value: AdminPaymentStatus; label: string }> = [
    { value: 'Unpaid', label: 'Chưa thanh toán' },
    { value: 'Pending', label: 'Đang chờ' },
    { value: 'Paid', label: 'Đã thanh toán' },
    { value: 'Failed', label: 'Thất bại' },
    { value: 'Refunded', label: 'Đã hoàn tiền' }
];

const METHOD_OPTIONS: Array<{ value: AdminPaymentMethod; label: string }> = [
    { value: 'COD', label: 'Thanh toán khi nhận hàng' },
    { value: 'BankTransfer', label: 'Chuyển khoản VietQR' },
    { value: 'EWallet', label: 'Ví điện tử' },
    { value: 'OnlineGateway', label: 'Cổng thanh toán online' }
];

const statusStyles: Record<AdminPaymentStatus, string> = {
    Unpaid: 'border-amber-200 bg-amber-50 text-amber-800',
    Pending: 'border-sky-200 bg-sky-50 text-sky-800',
    Paid: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Failed: 'border-red-200 bg-red-50 text-red-800',
    Refunded: 'border-violet-200 bg-violet-50 text-violet-800'
};

const statusLabels = Object.fromEntries(STATUS_OPTIONS.map(option => [option.value, option.label])) as Record<AdminPaymentStatus, string>;
const methodLabels = Object.fromEntries(METHOD_OPTIONS.map(option => [option.value, option.label])) as Record<AdminPaymentMethod, string>;

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh'
});

const formatDate = (value?: string | null) => {
    if (!value) return 'Chưa ghi nhận';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Không xác định' : dateFormatter.format(date);
};

const toUtcBoundary = (date: string, endOfDay: boolean) => {
    if (!date) return undefined;
    const time = endOfDay ? '23:59:59.999' : '00:00:00.000';
    return new Date(`${date}T${time}+07:00`).toISOString();
};

const getVisiblePages = (page: number, totalPages: number) => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const start = Math.min(Math.max(page - 2, 1), totalPages - 4);
    return Array.from({ length: 5 }, (_, index) => start + index);
};

const StatusBadge: React.FC<{ status: AdminPaymentStatus }> = ({ status }) => (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status] || 'border-stone-200 bg-stone-50 text-stone-700'}`}>
        {statusLabels[status] || status}
    </span>
);

const DetailField: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono = false }) => (
    <div className="min-w-0 border-b border-[#eee5de] py-3 last:border-b-0 sm:grid sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5">
        <dt className="text-sm font-medium text-[#765746]">{label}</dt>
        <dd className={`mt-1 min-w-0 break-words text-sm font-semibold text-[#2d2018] sm:mt-0 sm:text-right ${mono ? 'font-mono' : ''}`}>
            {children}
        </dd>
    </div>
);

const AdminPayments: React.FC = () => {
    const navigate = useNavigate();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState<AdminPaymentStatus | ''>('');
    const [method, setMethod] = useState<AdminPaymentMethod | ''>('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [paymentPage, setPaymentPage] = useState<AdminPaymentPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [detailReloadKey, setDetailReloadKey] = useState(0);
    const [summary, setSummary] = useState<AdminPaymentSummary | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);

    const dateRangeError = fromDate && toDate && fromDate > toDate
        ? 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.'
        : null;
    const hasFilters = Boolean(searchInput.trim() || status || method || fromDate || toDate);
    const filtersSettling = searchInput.trim() !== keyword;
    const filterQuery = useMemo<AdminPaymentQuery>(() => ({
        keyword: keyword || undefined,
        status: status || undefined,
        method: method || undefined,
        from: toUtcBoundary(fromDate, false),
        to: toUtcBoundary(toDate, true)
    }), [fromDate, keyword, method, status, toDate]);
    const visiblePages = useMemo(
        () => getVisiblePages(paymentPage?.page || page, paymentPage?.totalPages || 0),
        [page, paymentPage?.page, paymentPage?.totalPages]
    );

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setKeyword(searchInput.trim());
            setPage(1);
        }, 300);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        setExportError(null);
        setExportSuccess(null);
    }, [filterQuery]);

    useEffect(() => {
        if (dateRangeError) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        getAdminPayments({
            ...filterQuery,
            page,
            pageSize: PAGE_SIZE
        }, controller.signal)
            .then(data => setPaymentPage(data))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
                setError(requestError instanceof Error ? requestError.message : 'Không thể tải dữ liệu thanh toán. Vui lòng thử lại.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [dateRangeError, filterQuery, page, reloadKey]);

    useEffect(() => {
        if (dateRangeError) {
            setSummary(null);
            setSummaryError(null);
            setSummaryLoading(false);
            return;
        }

        const controller = new AbortController();
        setSummary(null);
        setSummaryError(null);
        setSummaryLoading(true);

        getAdminPaymentSummary(filterQuery, controller.signal)
            .then(data => setSummary(data))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
                setSummaryError(requestError instanceof Error ? requestError.message : 'Không thể tải tổng quan thanh toán.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setSummaryLoading(false);
            });

        return () => controller.abort();
    }, [dateRangeError, filterQuery, reloadKey]);

    useEffect(() => {
        if (!selectedPaymentId) return;
        const controller = new AbortController();
        setSelectedPayment(null);
        setDetailError(null);
        setDetailLoading(true);

        getAdminPaymentById(selectedPaymentId, controller.signal)
            .then(data => setSelectedPayment(data))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
                setDetailError(requestError instanceof Error ? requestError.message : 'Không thể tải chi tiết giao dịch.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setDetailLoading(false);
            });

        return () => controller.abort();
    }, [detailReloadKey, selectedPaymentId]);

    useEffect(() => {
        if (!selectedPaymentId) return;
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSelectedPaymentId(null);
        };
        window.addEventListener('keydown', handleEscape);
        window.setTimeout(() => closeButtonRef.current?.focus(), 0);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [selectedPaymentId]);

    const resetFilters = () => {
        setSearchInput('');
        setKeyword('');
        setStatus('');
        setMethod('');
        setFromDate('');
        setToDate('');
        setPage(1);
    };

    const closeDetail = () => {
        setSelectedPaymentId(null);
        setSelectedPayment(null);
        setDetailError(null);
    };

    const handleExport = async () => {
        if (dateRangeError || filtersSettling) return;

        setExporting(true);
        setExportError(null);
        setExportSuccess(null);
        try {
            const exportedFile = await exportAdminPayments(filterQuery);
            const downloadUrl = URL.createObjectURL(exportedFile.blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = exportedFile.fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
            setExportSuccess(`Đã tải tệp ${exportedFile.fileName}.`);
        } catch (requestError: unknown) {
            setExportError(requestError instanceof Error ? requestError.message : 'Không thể xuất CSV. Vui lòng thử lại.');
        } finally {
            setExporting(false);
        }
    };

    const payments = paymentPage?.items || [];

    return (
        <div className="min-h-screen bg-[#faf9f6] p-4 text-[#2d2018] sm:p-6 lg:p-8">
            <header className="mb-6 flex flex-col gap-4 border-b border-[#e8ddd5] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-extrabold tracking-tight text-[#4b2311] sm:text-3xl">Giao dịch thanh toán</h1>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-[#765746]">
                        Tra cứu trạng thái, số tiền và mã đối soát của các giao dịch khách hàng.
                    </p>
                </div>
                <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setReloadKey(value => value + 1)}
                        disabled={loading || summaryLoading}
                        aria-label="Làm mới dữ liệu giao dịch"
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M20 11a8.1 8.1 0 00-15.5-2M4 4v5h5M4 13a8.1 8.1 0 0015.5 2M20 20v-5h-5" />
                        </svg>
                        {loading || summaryLoading ? 'Đang làm mới…' : 'Làm mới dữ liệu'}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleExport}
                        disabled={exporting || loading || filtersSettling || Boolean(dateRangeError) || !paymentPage || paymentPage.total === 0}
                        aria-label="Xuất các giao dịch đang lọc thành tệp CSV"
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                            <path d="M5 19h14" />
                        </svg>
                        {exporting ? 'Đang tạo CSV…' : 'Xuất CSV'}
                    </Button>
                </div>
            </header>

            {(exportError || exportSuccess) && (
                <div className="mb-5" aria-live="polite">
                    {exportError && (
                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-900">
                            <span className="font-bold">Không xuất được CSV.</span> {exportError}
                        </div>
                    )}
                    {exportSuccess && !exportError && (
                        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                            {exportSuccess}
                        </p>
                    )}
                </div>
            )}

            <section aria-labelledby="payment-filters" className="mb-5 rounded-xl border border-[#e8ddd5] bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <h2 id="payment-filters" className="text-base font-bold text-[#4b2311]">Bộ lọc giao dịch</h2>
                        <p className="mt-0.5 text-sm text-[#765746]">Kết quả cập nhật tự động sau khi thay đổi bộ lọc.</p>
                    </div>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="min-h-11 rounded px-3 text-sm font-semibold text-[#657b35] transition-colors hover:bg-[#f1f4e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="block min-w-0">
                        <span className="mb-1.5 block text-sm font-semibold text-[#4b2311]">Tìm kiếm</span>
                        <span className="relative block">
                            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#765746]" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-3.5-3.5" />
                            </svg>
                            <input
                                type="search"
                                value={searchInput}
                                onChange={event => setSearchInput(event.target.value)}
                                placeholder="Mã đơn, khách hàng, mã giao dịch"
                                className="min-h-11 w-full rounded border border-[#d9ccc2] bg-white py-2 pl-10 pr-3 text-sm text-[#2d2018] placeholder:text-[#806b5e] focus:border-[#657b35] focus:outline-none focus:ring-2 focus:ring-[#657b35]/20"
                            />
                        </span>
                    </label>

                    <label className="block min-w-0">
                        <span className="mb-1.5 block text-sm font-semibold text-[#4b2311]">Trạng thái</span>
                        <select
                            value={status}
                            onChange={event => { setStatus(event.target.value as AdminPaymentStatus | ''); setPage(1); }}
                            className="min-h-11 w-full rounded border border-[#d9ccc2] bg-white px-3 text-sm text-[#2d2018] focus:border-[#657b35] focus:outline-none focus:ring-2 focus:ring-[#657b35]/20"
                        >
                            <option value="">Tất cả trạng thái</option>
                            {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>

                    <label className="block min-w-0">
                        <span className="mb-1.5 block text-sm font-semibold text-[#4b2311]">Phương thức</span>
                        <select
                            value={method}
                            onChange={event => { setMethod(event.target.value as AdminPaymentMethod | ''); setPage(1); }}
                            className="min-h-11 w-full rounded border border-[#d9ccc2] bg-white px-3 text-sm text-[#2d2018] focus:border-[#657b35] focus:outline-none focus:ring-2 focus:ring-[#657b35]/20"
                        >
                            <option value="">Tất cả phương thức</option>
                            {METHOD_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>

                    <fieldset className="min-w-0">
                        <legend className="mb-1.5 text-sm font-semibold text-[#4b2311]">Khoảng ngày tạo</legend>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="min-w-0">
                                <span className="sr-only">Từ ngày</span>
                                <input
                                    type="date"
                                    value={fromDate}
                                    max={toDate || undefined}
                                    onChange={event => { setFromDate(event.target.value); setPage(1); }}
                                    className="min-h-11 w-full min-w-0 rounded border border-[#d9ccc2] bg-white px-2 text-sm text-[#2d2018] focus:border-[#657b35] focus:outline-none focus:ring-2 focus:ring-[#657b35]/20"
                                    aria-describedby={dateRangeError ? 'payment-date-error' : undefined}
                                />
                            </label>
                            <label className="min-w-0">
                                <span className="sr-only">Đến ngày</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={event => { setToDate(event.target.value); setPage(1); }}
                                    className="min-h-11 w-full min-w-0 rounded border border-[#d9ccc2] bg-white px-2 text-sm text-[#2d2018] focus:border-[#657b35] focus:outline-none focus:ring-2 focus:ring-[#657b35]/20"
                                    aria-describedby={dateRangeError ? 'payment-date-error' : undefined}
                                />
                            </label>
                        </div>
                        {dateRangeError && <p id="payment-date-error" className="mt-1.5 text-sm font-medium text-red-700">{dateRangeError}</p>}
                    </fieldset>
                </div>
            </section>

            <section aria-labelledby="payment-summary-title" aria-busy={summaryLoading} className="mb-5 overflow-hidden rounded-xl border border-[#e8ddd5] bg-white shadow-sm">
                <div className="flex flex-col gap-1 border-b border-[#eee5de] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <h2 id="payment-summary-title" className="text-base font-bold text-[#4b2311]">Tổng quan theo bộ lọc</h2>
                    <p className="text-sm text-[#765746]">Tính trên toàn bộ kết quả, không chỉ trang hiện tại.</p>
                </div>

                {summaryError ? (
                    <div role="alert" className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <p className="font-bold text-red-900">Không tải được tổng quan</p>
                            <p className="mt-1 text-sm leading-6 text-red-800">{summaryError}</p>
                        </div>
                        <Button type="button" variant="secondary" onClick={() => setReloadKey(value => value + 1)} className="shrink-0 border-red-300 text-red-800 hover:bg-red-50">
                            Tải lại tổng quan
                        </Button>
                    </div>
                ) : (
                    <dl className="grid divide-y divide-[#eee5de] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        <div className="min-w-0 px-4 py-5 sm:px-5">
                            <dt className="text-sm font-semibold text-[#765746]">Giao dịch đã thanh toán</dt>
                            <dd className="mt-2 text-2xl font-extrabold text-[#2d2018]">
                                {summaryLoading || !summary ? <span className="block h-8 w-20 animate-pulse rounded bg-[#eee8e2]" aria-hidden="true" /> : summary.paidCount.toLocaleString('vi-VN')}
                            </dd>
                        </div>
                        <div className="min-w-0 px-4 py-5 sm:px-5">
                            <dt className="text-sm font-semibold text-[#765746]">Giao dịch chưa thanh toán</dt>
                            <dd className="mt-2 text-2xl font-extrabold text-[#2d2018]">
                                {summaryLoading || !summary ? <span className="block h-8 w-20 animate-pulse rounded bg-[#eee8e2]" aria-hidden="true" /> : summary.unpaidCount.toLocaleString('vi-VN')}
                            </dd>
                        </div>
                        <div className="min-w-0 bg-[#f5f7ef] px-4 py-5 sm:px-5">
                            <dt className="text-sm font-semibold text-[#516329]">Tổng tiền đã thanh toán</dt>
                            <dd className="mt-2 break-words text-2xl font-extrabold text-[#334116]">
                                {summaryLoading || !summary ? <span className="block h-8 w-36 animate-pulse rounded bg-[#dfe5cf]" aria-hidden="true" /> : currencyFormatter.format(summary.paidAmount)}
                            </dd>
                        </div>
                    </dl>
                )}
            </section>

            <div className="mb-3 flex min-h-6 items-center justify-between gap-4" aria-live="polite">
                <p className="text-sm font-medium text-[#765746]">
                    {paymentPage ? `Tổng giao dịch: ${paymentPage.total.toLocaleString('vi-VN')}` : 'Đang chuẩn bị dữ liệu giao dịch'}
                </p>
                {loading && paymentPage && <span className="text-sm font-medium text-[#657b35]">Đang cập nhật…</span>}
            </div>

            {error && (
                <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-bold">Không tải được giao dịch</p>
                        <p className="mt-1 text-sm leading-5">{error}</p>
                    </div>
                    <Button type="button" variant="secondary" onClick={() => setReloadKey(value => value + 1)} className="border-red-300 text-red-800 hover:bg-red-100">
                        Thử tải lại
                    </Button>
                </div>
            )}

            <section aria-label="Danh sách giao dịch thanh toán" aria-busy={loading} className="overflow-hidden rounded-xl border border-[#e8ddd5] bg-white shadow-sm">
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                        <thead className="border-b border-[#e8ddd5] bg-[#f7f4f0] text-[#604737]">
                            <tr>
                                <th scope="col" className="px-5 py-4 font-bold">Mã đơn</th>
                                <th scope="col" className="px-5 py-4 font-bold">Khách hàng</th>
                                <th scope="col" className="px-5 py-4 font-bold">Phương thức</th>
                                <th scope="col" className="px-5 py-4 text-right font-bold">Số tiền</th>
                                <th scope="col" className="px-5 py-4 font-bold">Trạng thái</th>
                                <th scope="col" className="px-5 py-4 font-bold">Mã giao dịch</th>
                                <th scope="col" className="px-5 py-4 font-bold">Thanh toán lúc</th>
                                <th scope="col" className="px-5 py-4 text-right font-bold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eee5de]">
                            {loading && !paymentPage && Array.from({ length: 6 }, (_, index) => (
                                <tr key={index} aria-hidden="true">
                                    {Array.from({ length: 8 }, (__, cellIndex) => (
                                        <td key={cellIndex} className="px-5 py-5">
                                            <div className="h-4 animate-pulse rounded bg-[#eee8e2]" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {!error && payments.map(payment => (
                                <tr key={payment.id} className="transition-colors hover:bg-[#fbfaf8]">
                                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#657b35]">#{payment.orderCode || payment.orderId.slice(0, 8)}</td>
                                    <td className="max-w-[190px] px-5 py-4 font-semibold text-[#2d2018]"><span className="block truncate" title={payment.customerName}>{payment.customerName || 'Chưa xác định'}</span></td>
                                    <td className="px-5 py-4 text-[#604737]">{methodLabels[payment.paymentMethod] || payment.paymentMethod}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-[#2d2018]">{currencyFormatter.format(payment.amount)}</td>
                                    <td className="px-5 py-4"><StatusBadge status={payment.paymentStatus} /></td>
                                    <td className="max-w-[170px] px-5 py-4 font-mono text-xs text-[#604737]"><span className="block truncate" title={payment.transactionCode || undefined}>{payment.transactionCode || 'Chưa có'}</span></td>
                                    <td className="whitespace-nowrap px-5 py-4 text-[#604737]">{formatDate(payment.paidAt)}</td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPaymentId(payment.id)}
                                            className="min-h-11 rounded px-3 text-sm font-bold text-[#657b35] transition-colors hover:bg-[#f1f4e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="divide-y divide-[#eee5de] md:hidden">
                    {loading && !paymentPage && Array.from({ length: 4 }, (_, index) => (
                        <div key={index} className="space-y-3 p-4" aria-hidden="true">
                            <div className="h-4 w-32 animate-pulse rounded bg-[#eee8e2]" />
                            <div className="h-4 w-full animate-pulse rounded bg-[#eee8e2]" />
                            <div className="h-9 w-full animate-pulse rounded bg-[#eee8e2]" />
                        </div>
                    ))}
                    {!error && payments.map(payment => (
                        <article key={payment.id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-mono text-xs font-bold text-[#657b35]">#{payment.orderCode || payment.orderId.slice(0, 8)}</p>
                                    <h3 className="mt-1 truncate text-base font-bold text-[#2d2018]">{payment.customerName || 'Chưa xác định'}</h3>
                                </div>
                                <StatusBadge status={payment.paymentStatus} />
                            </div>
                            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                                <dt className="text-[#765746]">Số tiền</dt>
                                <dd className="text-right font-bold">{currencyFormatter.format(payment.amount)}</dd>
                                <dt className="text-[#765746]">Phương thức</dt>
                                <dd className="text-right font-semibold">{methodLabels[payment.paymentMethod] || payment.paymentMethod}</dd>
                                <dt className="text-[#765746]">Thanh toán lúc</dt>
                                <dd className="text-right font-semibold">{formatDate(payment.paidAt)}</dd>
                            </dl>
                            <button
                                type="button"
                                onClick={() => setSelectedPaymentId(payment.id)}
                                className="mt-4 min-h-11 w-full rounded border border-[#cfd8b9] px-4 text-sm font-bold text-[#516329] transition-colors hover:bg-[#f1f4e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]"
                            >
                                Xem chi tiết giao dịch
                            </button>
                        </article>
                    ))}
                </div>

                {!loading && !error && payments.length === 0 && (
                    <div className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#e1d7cf] bg-[#f7f4f0] text-[#765746]" aria-hidden="true">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="M3 10h18M7 15h3" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-base font-bold text-[#4b2311]">{hasFilters ? 'Không tìm thấy giao dịch phù hợp' : 'Chưa có giao dịch thanh toán'}</h3>
                        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#765746]">
                            {hasFilters ? 'Thử bỏ bớt bộ lọc hoặc kiểm tra lại mã đơn, khách hàng và mã giao dịch.' : 'Giao dịch sẽ xuất hiện tại đây khi khách hàng tạo đơn và chọn phương thức thanh toán.'}
                        </p>
                        {hasFilters && <Button type="button" variant="secondary" onClick={resetFilters} className="mx-auto mt-4">Xóa bộ lọc</Button>}
                    </div>
                )}

                {paymentPage && paymentPage.totalPages > 1 && (
                    <nav aria-label="Phân trang giao dịch" className="flex flex-col gap-3 border-t border-[#e8ddd5] bg-[#f7f4f0] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-sm font-medium text-[#765746]">
                            Trang {paymentPage.page} / {paymentPage.totalPages}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button type="button" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={paymentPage.page <= 1 || loading} className="min-h-11 rounded border border-[#d9ccc2] bg-white px-3 text-sm font-semibold text-[#4b2311] hover:bg-[#f1ece7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35] disabled:cursor-not-allowed disabled:opacity-50">Trang trước</button>
                            {visiblePages.map(pageNumber => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => setPage(pageNumber)}
                                    disabled={loading}
                                    aria-current={paymentPage.page === pageNumber ? 'page' : undefined}
                                    className={`h-11 min-w-11 rounded border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35] ${paymentPage.page === pageNumber ? 'border-[#657b35] bg-[#657b35] text-white' : 'border-[#d9ccc2] bg-white text-[#4b2311] hover:bg-[#f1ece7]'}`}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                            <button type="button" onClick={() => setPage(value => Math.min(paymentPage.totalPages, value + 1))} disabled={paymentPage.page >= paymentPage.totalPages || loading} className="min-h-11 rounded border border-[#d9ccc2] bg-white px-3 text-sm font-semibold text-[#4b2311] hover:bg-[#f1ece7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35] disabled:cursor-not-allowed disabled:opacity-50">Trang sau</button>
                        </div>
                    </nav>
                )}
            </section>

            <Modal isOpen={Boolean(selectedPaymentId)} onClose={closeDetail} zIndex={70} className="bg-[#20150E]/45">
                <div role="dialog" aria-modal="true" aria-labelledby="payment-detail-title" className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#e8ddd5] bg-white shadow-2xl">
                    <header className="flex items-start justify-between gap-5 border-b border-[#e8ddd5] bg-[#f7f4f0] px-5 py-4 sm:px-6">
                        <div className="min-w-0">
                            <h2 id="payment-detail-title" className="text-xl font-extrabold text-[#4b2311]">Chi tiết giao dịch</h2>
                            <p className="mt-1 truncate text-sm text-[#765746]">{selectedPayment?.transactionCode || selectedPaymentId}</p>
                        </div>
                        <button ref={closeButtonRef} type="button" onClick={closeDetail} aria-label="Đóng chi tiết giao dịch" className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-[#d9ccc2] bg-white text-[#4b2311] transition-colors hover:bg-[#eee8e2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]">✕</button>
                    </header>

                    <div className="overflow-y-auto px-5 py-5 sm:px-6">
                        {detailLoading && (
                            <div className="space-y-3" aria-live="polite">
                                <p className="text-sm font-medium text-[#765746]">Đang tải chi tiết giao dịch…</p>
                                {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded bg-[#eee8e2]" />)}
                            </div>
                        )}

                        {detailError && (
                            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
                                <p className="font-bold">Không tải được chi tiết</p>
                                <p className="mt-1 text-sm">{detailError}</p>
                                <Button type="button" variant="secondary" onClick={() => setDetailReloadKey(value => value + 1)} className="mt-4 border-red-300 text-red-800 hover:bg-red-100">Thử tải lại</Button>
                            </div>
                        )}

                        {selectedPayment && !detailLoading && (
                            <>
                                <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#dfe5cf] bg-[#f5f7ef] p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[#516329]">Số tiền giao dịch</p>
                                        <p className="mt-1 text-2xl font-extrabold text-[#334116]">{currencyFormatter.format(selectedPayment.amount)}</p>
                                    </div>
                                    <StatusBadge status={selectedPayment.paymentStatus} />
                                </div>

                                <dl>
                                    <DetailField label="Mã đơn hàng" mono>#{selectedPayment.orderCode || selectedPayment.orderId.slice(0, 8)}</DetailField>
                                    <DetailField label="Order ID" mono>{selectedPayment.orderId}</DetailField>
                                    <DetailField label="Khách hàng">{selectedPayment.customerName || 'Chưa xác định'}</DetailField>
                                    <DetailField label="Tổng giá trị đơn">{currencyFormatter.format(selectedPayment.orderTotalAmount)}</DetailField>
                                    <DetailField label="Phương thức">{methodLabels[selectedPayment.paymentMethod] || selectedPayment.paymentMethod}</DetailField>
                                    <DetailField label="Mã giao dịch" mono>{selectedPayment.transactionCode || 'Chưa có'}</DetailField>
                                    <DetailField label="Thanh toán lúc">{formatDate(selectedPayment.paidAt)}</DetailField>
                                    <DetailField label="Tạo lúc">{formatDate(selectedPayment.createdAt)}</DetailField>
                                    <DetailField label="Payment ID" mono>{selectedPayment.id}</DetailField>
                                </dl>
                            </>
                        )}
                    </div>

                    <footer className="flex flex-col-reverse gap-2 border-t border-[#e8ddd5] bg-[#f7f4f0] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                        <Button type="button" variant="secondary" onClick={closeDetail}>Đóng chi tiết</Button>
                        <Button type="button" onClick={() => selectedPayment && navigate(`/admin/orders?orderId=${encodeURIComponent(selectedPayment.orderId)}`)} disabled={!selectedPayment}>Xem đơn hàng</Button>
                    </footer>
                </div>
            </Modal>
        </div>
    );
};

export default AdminPayments;
