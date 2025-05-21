'use client'
import AuthProvider from "@/components/providers/AuthProvider";
import { getAuthSession } from "lib/nextauth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname,useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoMdPeople } from "react-icons/io";
import { IoDocumentsOutline } from "react-icons/io5";
import { MdCreate } from "react-icons/md";
import { TbTournament } from "react-icons/tb";
import { Toaster } from "react-hot-toast";


const MasterLayout = ({ children, user }) => {

    const pathname = usePathname();

    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState(false);
    const [show, setShow] = useState(false);

    const dashboardControl = () => {
        setActive(!active);
    };

    const showProfileControl = () => {
        setShow(!show);
    };





    return (
        <AuthProvider>
            <Toaster position="top-center" reverseOrder={false} />




            <section className={`dashboard ${active && "active"}`} onClick={()=> show ===true && setShow(false) }>
                <div className="dashboard__inner d-flex">
                    {/* Dashboard Sidebar Start */}
                    <div className={`dashboard-sidebar ${active && "active"}`}>
                        <button
                            type="button"
                            className="dashboard-sidebar__close d-lg-none d-flex text-body hover-text-main"  onClick={dashboardControl}
                        >
                            <i className="las la-times" />
                        </button>
                        <div className="dashboard-sidebar__inner">
                            <Link scroll={false} href="/" className="logo mb-48">
                                <img
                                    src="/assets/images/logo/logo.png"
                                    alt=""
                                    className="white-version"
                                />
                                <img
                                    src="/assets/images/logo/white-logo-two.png"
                                    alt=""
                                    className="dark-version"
                                />
                            </Link>
                            <Link scroll={false} href="/" className="logo favicon mb-48">
                                <img src="/assets/images/logo/logo-small.png" alt="" style={{ width: "40px", height: "auto" }}/>
                            </Link>
                            {/* Sidebar List Start */}
                            <ul className="sidebar-list">
                                <li className={`sidebar-list__item ${pathname.startsWith("/tournament") && "activePage"}`}>
                                    <Link scroll={false} href="/tournament" className="sidebar-list__link">
                                        <span className="sidebar-list__icon">
                                            <IoDocumentsOutline />
                                        </span>
                                        <span className="text">大会一覧</span>
                                    </Link>
                                </li>
                                <li className={`sidebar-list__item ${pathname == "/create-tournament" && "activePage"}`}>
                                    <Link scroll={false} href="/create-tournament" className="sidebar-list__link">
                                        <span className="sidebar-list__icon">
                                            <TbTournament />
                                        </span>
                                        <span className="text">トーナメント作成</span>
                                    </Link>
                                </li>
                                <li className={`sidebar-list__item ${pathname == "/follower" && "activePage"}`}>
                                    <Link scroll={false} href="/participants" className="sidebar-list__link">
                                        <span className="sidebar-list__icon">
                                            <IoMdPeople />
                                        </span>
                                        <span className="text">参加者</span>
                                    </Link>
                                </li>
                                <li className={`sidebar-list__item ${pathname == "/match-order" && "activePage"}`}>
                                    <Link scroll={false} href="/match-order" className="sidebar-list__link">
                                        <span className="sidebar-list__icon">
                                            <MdCreate />
                                        </span>
                                        <span className="text">試合進行</span>
                                    </Link>
                                </li>


                                <li className="sidebar-list__item">
                                    <button
                                        onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                                        className="sidebar-list__link btn-reset"
                                    >
                                        <span className="sidebar-list__icon">
                                        <img src="/assets/images/icons/sidebar-icon13.svg" alt="" className="icon" />
                                        <img src="/assets/images/icons/sidebar-icon-active13.svg" alt="" className="icon icon-active" />
                                        </span>
                                        <span className="text">Logout</span>
                                    </button>
                                </li>
                            </ul>
                            {/* Sidebar List End */}
                        </div>
                    </div>

                    <div className="dashboard-body">
                        {/* Dashboard Nav Start */}
                        <div className="dashboard-nav bg-white flx-between gap-md-3 gap-2">
                            <div className="dashboard-nav__left flx-align gap-md-3 gap-2">
                                <button onClick={dashboardControl}
                                    type="button"
                                    className="icon-btn bar-icon text-heading bg-gray-seven flx-center"
                                >
                                    <i className="las la-bars" />
                                </button>
                                <button onClick={dashboardControl}
                                    type="button"
                                    className="icon-btn arrow-icon text-heading bg-gray-seven flx-center"
                                >
                                    <img src="/assets/images/icons/angle-right.svg" alt="" />
                                </button>
                                <form action="#" className="search-input d-sm-block d-none">
                                    <span className="icon">
                                        <img
                                            src="/assets/images/icons/search-dark.svg"
                                            alt=""
                                            className="white-version"
                                        />
                                        <img
                                            src="/assets/images/icons/search-dark-white.svg"
                                            alt=""
                                            className="dark-version"
                                        />
                                    </span>
                                    <input
                                        type="text"
                                        className="common-input common-input--md common-input--bg pill w-100"
                                        placeholder="Search here..."
                                    />
                                </form>
                            </div>
                            <div className="dashboard-nav__right" >
                                <div className="header-right flx-align">
                                    <div className="header-right__inner gap-sm-3 gap-2 flx-align d-flex">
                                        <div className="user-profile">
                                            <button className="user-profile__button flex-align" onClick={showProfileControl}>
                                                <span className="user-profile__thumb">
                                                    <img
                                                    src={user?.avatar || "/assets/images/logo/logo-small.png"} // ✅ user.avatar があればそれを使う
                                                    className="cover-img"
                                                    alt="User Avatar"
                                                    />

                                                </span>
                                            </button>
                                            <ul className={`user-profile-dropdown ${show && "show"} `}>
                                                <li className="sidebar-list__item">
                                                    <Link scroll={false} href="/dashboard-profile" className="sidebar-list__link">
                                                        <span className="sidebar-list__icon">
                                                            <img
                                                                src="/assets/images/icons/sidebar-icon2.svg"
                                                                alt=""
                                                                className="icon"
                                                            />
                                                            <img
                                                                src="/assets/images/icons/sidebar-icon-active2.svg"
                                                                alt=""
                                                                className="icon icon-active"
                                                            />
                                                        </span>
                                                        <span className="text">Profile</span>
                                                    </Link>
                                                </li>
                                                <li className="sidebar-list__item">
                                                    <Link scroll={false} href="/setting" className="sidebar-list__link">
                                                        <span className="sidebar-list__icon">
                                                            <img
                                                                src="/assets/images/icons/sidebar-icon10.svg"
                                                                alt=""
                                                                className="icon"
                                                            />
                                                            <img
                                                                src="/assets/images/icons/sidebar-icon-active10.svg"
                                                                alt=""
                                                                className="icon icon-active"
                                                            />
                                                        </span>
                                                        <span className="text">Settings</span>
                                                    </Link>
                                                </li>
                                                <li className="sidebar-list__item">
                                                <button
                                                    onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                                                    className="sidebar-list__link btn-reset"
                                                >
                                                    <span className="sidebar-list__icon">
                                                    <img src="/assets/images/icons/sidebar-icon13.svg" alt="" className="icon" />
                                                    <img src="/assets/images/icons/sidebar-icon-active13.svg" alt="" className="icon icon-active" />
                                                    </span>
                                                    <span className="text">Logout</span>
                                                </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="language-select flx-align select-has-icon">
                                            <img
                                                src="/assets/images/icons/globe.svg"
                                                alt=""
                                                className="globe-icon white-version"
                                            />
                                            <img
                                                src="/assets/images/icons/globe-white.svg"
                                                alt=""
                                                className="globe-icon dark-version"
                                            />
                                            <select className="select py-0 ps-2 border-0 fw-500">
                                                <option value={1}>Eng</option>
                                                <option value={2}>Jpn</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* children */}
                        {children}
                        {/* Dashboard Footer */}
                        <div className="dashboard-footer bottom-footer-two mt-32 border-0 bg-white">
                            <div className="bottom-footer__inner flx-between gap-3">
                                <p className="bottom-footer__text font-14">
                                    {" "}
                                    Copyright © 2025 Tournament PRO.
                                </p>
                                <div className="footer-links gap-4">
                                    <Link scroll={false} href="/#" className="footer-link hover-text-heading font-14">
                                        Terms of service
                                    </Link>
                                    <Link scroll={false} href="/#" className="footer-link hover-text-heading font-14">
                                        Privacy Policy
                                    </Link>
                                    <Link scroll={false} href="/#" className="footer-link hover-text-heading font-14">
                                        cookies
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </section>




        </AuthProvider>
    );
}

export default MasterLayout;