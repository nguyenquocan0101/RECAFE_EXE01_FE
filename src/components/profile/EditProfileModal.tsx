import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/services/api/addresses'

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.25rem',
    border: '1.5px solid #e8ddd5',
    fontSize: '0.875rem',
    color: '#4b2311',
    background: '#faf9f6',
    outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
}

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    addresses: any[]
    loadingAddresses: boolean
    fetchAddresses: () => Promise<void>
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isOpen,
    onClose,
    addresses,
    loadingAddresses,
    fetchAddresses,
}) => {
    const { language } = useLanguage()
    const { user, isAdmin, isStaff, logout, changePassword } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    // Modal Tab Control
    const [modalTab, setModalTab] = useState<'info' | 'address'>('info')

    // Address form states
    const [isEditingAddress, setIsEditingAddress] = useState(false)
    const [editingAddress, setEditingAddress] = useState<any | null>(null)
    const [addrReceiverName, setAddrReceiverName] = useState('')
    const [addrPhone, setAddrPhone] = useState('')
    const [addrProvince, setAddrProvince] = useState('')
    const [addrDistrict, setAddrDistrict] = useState('')
    const [addrWard, setAddrWard] = useState('')
    const [addrDetail, setAddrDetail] = useState('')
    const [addrIsDefault, setAddrIsDefault] = useState(false)

    // Password form states
    const [currentPwd, setCurrentPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const [loadingPwd, setLoadingPwd] = useState(false)
    const [showPwdForm, setShowPwdForm] = useState(false)

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setModalTab('info')
            resetAddrForm()
            setCurrentPwd('')
            setNewPwd('')
            setConfirmPwd('')
            setShowPwdForm(false)
        }
    }, [isOpen])

    const resetAddrForm = () => {
        setAddrReceiverName('')
        setAddrPhone('')
        setAddrProvince('')
        setAddrDistrict('')
        setAddrWard('')
        setAddrDetail('')
        setAddrIsDefault(false)
        setEditingAddress(null)
        setIsEditingAddress(false)
    }

    const handleEditAddr = (addr: any) => {
        setEditingAddress(addr)
        setAddrReceiverName(addr.receiverName || '')
        setAddrPhone(addr.phone || '')
        setAddrProvince(addr.province || '')
        setAddrDistrict(addr.district || '')
        setAddrWard(addr.ward || '')
        setAddrDetail(addr.detailAddress || '')
        setAddrIsDefault(addr.isDefault || false)
        setIsEditingAddress(true)
    }

    const handleSaveAddr = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addrReceiverName || !addrPhone || !addrProvince || !addrDistrict || !addrWard || !addrDetail) {
            showToast(language === 'vi' ? 'Vui lòng nhập đầy đủ thông tin địa chỉ!' : 'Please fill in all address details!', 'info')
            return
        }
        const payload = {
            receiverName: addrReceiverName,
            phone: addrPhone,
            province: addrProvince,
            district: addrDistrict,
            ward: addrWard,
            detailAddress: addrDetail,
            isDefault: addrIsDefault,
        }
        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, payload)
                showToast(language === 'vi' ? 'Cập nhật địa chỉ thành công!' : 'Address updated successfully!', 'success')
            } else {
                await createAddress(payload)
                showToast(language === 'vi' ? 'Thêm địa chỉ mới thành công!' : 'New address added successfully!', 'success')
            }
            resetAddrForm()
            fetchAddresses()
        } catch (error: any) {
            showToast(error.message || 'Không thể lưu địa chỉ', 'error')
        }
    }

    const handleDeleteAddr = async (id: string) => {
        if (!window.confirm(language === 'vi' ? 'Bạn có chắc muốn xóa địa chỉ này?' : 'Are you sure you want to delete this address?')) return
        try {
            await deleteAddress(id)
            showToast(language === 'vi' ? 'Đã xóa địa chỉ!' : 'Address deleted!', 'success')
            fetchAddresses()
        } catch (error: any) {
            showToast(error.message || 'Không thể xóa địa chỉ', 'error')
        }
    }

    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultAddress(id)
            showToast(language === 'vi' ? 'Đặt địa chỉ mặc định thành công!' : 'Default address set successfully!', 'success')
            fetchAddresses()
        } catch (error: any) {
            showToast(error.message || 'Không thể đặt mặc định', 'error')
        }
    }

    const handleChangePwd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPwd || !newPwd || !confirmPwd) {
            showToast(language === 'vi' ? 'Vui lòng nhập đầy đủ thông tin mật khẩu!' : 'Please fill in all password fields!', 'info')
            return
        }
        if (newPwd.length < 6) {
            showToast(language === 'vi' ? 'Mật khẩu mới phải có ít nhất 6 ký tự!' : 'New password must be at least 6 characters long!', 'info')
            return
        }
        if (newPwd !== confirmPwd) {
            showToast(language === 'vi' ? 'Xác nhận mật khẩu không khớp!' : 'Passwords do not match!', 'info')
            return
        }
        setLoadingPwd(true)
        try {
            await changePassword(currentPwd, newPwd)
            showToast(language === 'vi' ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!', 'success')
            setCurrentPwd('')
            setNewPwd('')
            setConfirmPwd('')
            setShowPwdForm(false)
        } catch (error: any) {
            showToast(error.message || 'Mật khẩu hiện tại không đúng', 'error')
        } finally {
            setLoadingPwd(false)
        }
    }

    const handleLogout = () => {
        logout()
        showToast(language === 'vi' ? 'Đăng xuất thành công!' : 'Logged out successfully!', 'success')
        navigate('/')
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} zIndex={999} closeOnOverlayClick={true}>
            <div
                className="bg-white rounded shadow-2xl w-full max-w-[680px] border border-[#e8ddd5] relative mx-4 max-h-[85vh] flex flex-col overflow-hidden font-sans"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-[#f3ede8] flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#4b2311]">
                        {language === 'vi' ? 'Chỉnh sửa tài khoản & địa chỉ' : 'Account & Address Settings'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded bg-[#f5f0eb] border-none flex items-center justify-center text-[#4b2311] hover:bg-[#e8ddd5] transition-colors cursor-pointer"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="px-6 pt-4 flex-shrink-0">
                    <div className="flex gap-1 bg-[#f5f0eb] rounded p-1">
                        <button
                            onClick={() => { setModalTab('info'); resetAddrForm(); }}
                            className={`flex-1 py-2 rounded font-bold text-xs transition-all cursor-pointer border-none outline-none ${
                                modalTab === 'info' ? 'bg-white text-[#4b2311] shadow-sm' : 'bg-transparent text-[#9c7a65]'
                            }`}
                        >
                            {language === 'vi' ? 'Thông tin & Mật khẩu' : 'Profile & Password'}
                        </button>
                        <button
                            onClick={() => { setModalTab('address'); resetAddrForm(); }}
                            className={`flex-1 py-2 rounded font-bold text-xs transition-all cursor-pointer border-none outline-none ${
                                modalTab === 'address' ? 'bg-white text-[#4b2311] shadow-sm' : 'bg-transparent text-[#9c7a65]'
                            }`}
                        >
                            {language === 'vi' ? 'Sổ địa chỉ' : 'Address Book'}
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    
                    {/* TAB 1: Profile Info & Change Password */}
                    {modalTab === 'info' && (
                        <div className="space-y-6">
                            {/* Readonly Info */}
                            <div className="bg-[#faf9f6] rounded p-4 space-y-3">
                                <h4 className="text-xs font-black text-[#9c7a65] tracking-wider uppercase mb-1">
                                    {language === 'vi' ? 'Thông tin cơ bản' : 'Basic Info'}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-[#9c7a65] font-bold">{language === 'vi' ? 'Tên tài khoản' : 'Username'}</p>
                                        <p className="text-sm font-bold text-[#4b2311] mt-0.5">{user?.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#9c7a65] font-bold">Email</p>
                                        <p className="text-sm font-bold text-[#4b2311] mt-0.5">{user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#9c7a65] font-bold">{language === 'vi' ? 'Họ và tên' : 'Full Name'}</p>
                                        <p className="text-sm font-bold text-[#4b2311] mt-0.5">{user?.fullName || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#9c7a65] font-bold">{language === 'vi' ? 'Vai trò' : 'Role'}</p>
                                        <p className="text-sm font-bold text-[#4b2311] mt-0.5">
                                            {isAdmin ? (language === 'vi' ? 'Quản trị viên' : 'Admin') : isStaff ? (language === 'vi' ? 'Nhân viên' : 'Staff') : (language === 'vi' ? 'Khách hàng' : 'Customer')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Subform */}
                            <div className="border border-[#e8ddd5] rounded overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowPwdForm(!showPwdForm)}
                                    className="w-full flex items-center justify-between p-4 bg-[#faf9f6] border-none font-bold text-xs text-[#4b2311] cursor-pointer"
                                >
                                    <span>{language === 'vi' ? 'Đổi mật khẩu tài khoản' : 'Change Password'}</span>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`transition-transform duration-200 ${showPwdForm ? 'rotate-180' : ''}`}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>

                                {showPwdForm && (
                                    <form onSubmit={handleChangePwd} className="p-4 border-t border-[#e8ddd5] bg-white space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[#9c7a65] mb-1.5">
                                                {language === 'vi' ? 'Mật khẩu hiện tại *' : 'Current Password *'}
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPwd}
                                                onChange={e => setCurrentPwd(e.target.value)}
                                                style={inputStyle}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[#9c7a65] mb-1.5">
                                                {language === 'vi' ? 'Mật khẩu mới *' : 'New Password *'}
                                            </label>
                                            <input
                                                type="password"
                                                value={newPwd}
                                                onChange={e => setNewPwd(e.target.value)}
                                                style={inputStyle}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[#9c7a65] mb-1.5">
                                                {language === 'vi' ? 'Xác nhận mật khẩu mới *' : 'Confirm New Password *'}
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPwd}
                                                onChange={e => setConfirmPwd(e.target.value)}
                                                style={inputStyle}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loadingPwd}
                                            variant="primary"
                                        >
                                            {language === 'vi' ? 'Xác nhận đổi mật khẩu' : 'Confirm Password Change'}
                                        </Button>
                                    </form>
                                )}
                            </div>

                            <div className="border-t border-[#f3ede8] pt-6 flex justify-between">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="bg-red-50 text-red-600 border border-red-200 py-2.5 px-4 rounded font-bold text-xs hover:bg-red-100 transition-colors duration-150 cursor-pointer"
                                >
                                    {language === 'vi' ? 'Đăng xuất tài khoản' : 'Log Out'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="border border-[#e8ddd5] py-2.5 px-6 rounded font-bold text-xs hover:bg-[#faf9f6] transition-colors duration-150 cursor-pointer text-[#9c7a65]"
                                >
                                    {language === 'vi' ? 'Đóng' : 'Close'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Address Book */}
                    {modalTab === 'address' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-[#9c7a65] uppercase tracking-wider">
                                    {language === 'vi' ? 'Danh sách địa chỉ nhận hàng' : 'Saved Addresses'}
                                </h4>
                                {!isEditingAddress && (
                                    <button
                                        onClick={() => { resetAddrForm(); setIsEditingAddress(true); }}
                                        className="bg-transparent border-none outline-none text-[#657b35] hover:text-[#4d5e28] py-1.5 px-3 font-bold text-xs transition-colors duration-150 cursor-pointer"
                                    >
                                        + {language === 'vi' ? 'Thêm địa chỉ mới' : 'Add New Address'}
                                    </button>
                                )}
                            </div>

                            {/* Address Form (Inline) */}
                            {isEditingAddress && (
                                <form onSubmit={handleSaveAddr} className="bg-[#faf9f6] rounded p-4 space-y-4">
                                    <h5 className="font-bold text-sm text-[#4b2311]">
                                        {editingAddress ? (language === 'vi' ? 'Cập nhật địa chỉ' : 'Update Address') : (language === 'vi' ? 'Thêm địa chỉ mới' : 'Add New Address')}
                                    </h5>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#9c7a65] mb-1">
                                                {language === 'vi' ? 'Họ và tên người nhận *' : 'Receiver Name *'}
                                            </label>
                                            <input
                                                type="text"
                                                value={addrReceiverName}
                                                onChange={e => setAddrReceiverName(e.target.value)}
                                                style={inputStyle}
                                                placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'John Doe'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#9c7a65] mb-1">
                                                {language === 'vi' ? 'Số điện thoại liên hệ *' : 'Phone Number *'}
                                            </label>
                                            <input
                                                type="text"
                                                value={addrPhone}
                                                onChange={e => setAddrPhone(e.target.value)}
                                                style={inputStyle}
                                                placeholder="09XXXXXXXX"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#9c7a65] mb-1">
                                                {language === 'vi' ? 'Tỉnh/Thành phố *' : 'Province/City *'}
                                            </label>
                                            <input
                                                type="text"
                                                value={addrProvince}
                                                onChange={e => setAddrProvince(e.target.value)}
                                                style={inputStyle}
                                                placeholder={language === 'vi' ? 'TP. Hồ Chí Minh' : 'Ho Chi Minh City'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#9c7a65] mb-1">
                                                {language === 'vi' ? 'Quận/Huyện *' : 'District *'}
                                            </label>
                                            <input
                                                type="text"
                                                value={addrDistrict}
                                                onChange={e => setAddrDistrict(e.target.value)}
                                                style={inputStyle}
                                                placeholder={language === 'vi' ? 'Quận 1' : 'District 1'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#9c7a65] mb-1">
                                                {language === 'vi' ? 'Phường/Xã *' : 'Ward *'}
                                            </label>
                                            <input
                                                type="text"
                                                value={addrWard}
                                                onChange={e => setAddrWard(e.target.value)}
                                                style={inputStyle}
                                                placeholder={language === 'vi' ? 'Phường Bến Nghé' : 'Ben Nghe Ward'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#9c7a65] mb-1">
                                                {language === 'vi' ? 'Địa chỉ chi tiết (số nhà, tên đường...) *' : 'Detail Address *'}
                                            </label>
                                            <input
                                                type="text"
                                                value={addrDetail}
                                                onChange={e => setAddrDetail(e.target.value)}
                                                style={inputStyle}
                                                placeholder={language === 'vi' ? '123 Lê Lợi' : '123 Le Loi St'}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4">
                                        <input
                                            type="checkbox"
                                            id="addr-default"
                                            checked={addrIsDefault}
                                            onChange={e => setAddrIsDefault(e.target.checked)}
                                            className="w-4 h-4 rounded accent-[#657b35]"
                                        />
                                        <label htmlFor="addr-default" className="text-xs font-bold text-[#4b2311] cursor-pointer">
                                            {language === 'vi' ? 'Đặt làm địa chỉ nhận hàng mặc định' : 'Set as default delivery address'}
                                        </label>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                        >
                                            {language === 'vi' ? 'Lưu địa chỉ' : 'Save Address'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={resetAddrForm}
                                        >
                                            {language === 'vi' ? 'Hủy' : 'Cancel'}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* Address List */}
                            {loadingAddresses ? (
                                <div className="flex flex-col items-center justify-center py-6 gap-2">
                                    <div className="w-6 h-6 rounded-full border-2 border-[#657b35] border-t-transparent animate-spin" />
                                    <span className="text-xs text-[#9c7a65]">
                                        {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                                    </span>
                                </div>
                            ) : addresses.length === 0 && !isEditingAddress ? (
                                <div className="text-center py-8 border border-dashed border-[#e8ddd5] rounded bg-[#faf9f6]">
                                    <p className="text-xs text-[#9c7a65] font-semibold">
                                        {language === 'vi' ? 'Chưa lưu địa chỉ giao hàng nào.' : 'No saved delivery addresses found.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`bg-white border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors ${
                                                addr.isDefault ? 'border-[#657b35]' : 'border-[#e8ddd5]'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                    <span className="font-extrabold text-sm text-[#4b2311]">
                                                        {addr.receiverName}
                                                    </span>
                                                    <span className="text-xs text-[#9c7a65] font-semibold">
                                                        ({addr.phone})
                                                    </span>
                                                    {addr.isDefault && (
                                                        <span className="bg-[#ecfdf5] text-[#065f46] text-[9px] font-black px-2 py-0.5 rounded border border-[#a7f3d0]/30 uppercase tracking-wider">
                                                            {language === 'vi' ? 'Mặc định' : 'Default'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[#68361c] leading-relaxed">
                                                    {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                                <button
                                                    onClick={() => handleEditAddr(addr)}
                                                    className="border border-[#e8ddd5] py-1 px-3 rounded font-bold text-xs text-[#4b2311] hover:bg-[#faf9f6] transition-colors cursor-pointer"
                                                >
                                                    {language === 'vi' ? 'Sửa' : 'Edit'}
                                                </button>
                                                {!addr.isDefault && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSetDefault(addr.id)}
                                                            className="border border-[#657b35] text-[#657b35] py-1 px-3 rounded font-bold text-xs hover:bg-[#657b35]/5 transition-colors cursor-pointer"
                                                        >
                                                            {language === 'vi' ? 'Đặt mặc định' : 'Set Default'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAddr(addr.id)}
                                                            className="border border-red-200 text-red-600 py-1 px-3 rounded font-bold text-xs hover:bg-red-50 transition-colors cursor-pointer"
                                                        >
                                                            {language === 'vi' ? 'Xóa' : 'Delete'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t border-[#f3ede8] pt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="border border-[#e8ddd5] py-2.5 px-6 rounded font-bold text-xs hover:bg-[#faf9f6] transition-colors duration-150 cursor-pointer text-[#9c7a65]"
                                >
                                    {language === 'vi' ? 'Đóng' : 'Close'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}
