"use client";

import Logo from "@/components/Logo";
import { fetchUser } from "@/components/NavUser";
import SearchBar from "@/components/SearchBar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type config from "@/config/config.json";
import { getNavigationItemLabel } from "@/lib/i18n/navigationLabels";
import type { NavigationLink } from "@/types/navigation";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { BsPerson } from "react-icons/bs";
import { LuArrowRight, LuX } from "react-icons/lu";
import Gravatar from "react-gravatar";

type DrawerCustomer = Awaited<ReturnType<typeof fetchUser>>;

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  menuItems: NavigationLink[];
  navigationButton: {
    enable: boolean;
    label: string;
    link: string;
  };
  settings: typeof config.settings;
}

const useDrawerCustomer = (open: boolean) => {
  const pathname = usePathname();
  const [customer, setCustomer] = useState<DrawerCustomer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;
    setLoading(true);

    const loadCustomer = async () => {
      try {
        const data = await fetchUser();
        if (isActive) {
          setCustomer(data);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadCustomer();

    return () => {
      isActive = false;
    };
  }, [open, pathname]);

  return { customer, setCustomer, loading } as const;
};

const MobileDrawerUserSection: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { customer, setCustomer, loading } = useDrawerCustomer(open);
  const t = useTranslations("mobileDrawer");

  const handleLogout = () => {
    const logout = async () => {
      try {
        await fetch("/api/customer/logout", {
          method: "POST",
          credentials: "same-origin",
        });
      } finally {
        setCustomer(null);
        onClose();
      }
    };

    void logout();
  };

  const greetingName = useMemo(
    () => customer?.firstName?.split(" ")?.[0] ?? "",
    [customer?.firstName],
  );

  return (
    <section className="space-y-5 rounded-2xl border border-border/60 bg-white/95 p-6 shadow-md  ">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border/40 bg-white  ">
          {customer ? (
            <Gravatar
              email={customer.email ?? ""}
              className="h-full w-full object-cover"
              style={{ borderRadius: "9999px" }}
            />
          ) : (
            <BsPerson className="text-4xl text-primary " />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-lg font-semibold text-text-dark ">
            {customer
              ? t("greeting", { name: greetingName })
              : t("guestGreeting")}
          </p>
          <p className="text-sm text-text-light ">
            {customer ? customer.email : t("guestDescription")}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-base font-medium text-text-light ">
          {t("loadingProfile")}
        </p>
      ) : customer ? (
        <div className="grid gap-3">
          <Link
            href="/account"
            onClick={onClose}
            className="btn btn-outline-primary justify-center text-center py-3 text-base"
          >
            {t("goToAccount")}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-primary justify-center text-center py-3 text-base"
          >
            {t("logout")}
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          <Link
            href="/login"
            onClick={onClose}
            className="btn btn-primary justify-center text-center py-3 text-base"
          >
            {t("login")}
          </Link>
          <Link
            href="/sign-up"
            onClick={onClose}
            className="btn btn-outline-primary justify-center text-center py-3 text-base"
          >
            {t("createAccount")}
          </Link>
        </div>
      )}
    </section>
  );
};

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  menuItems,
  navigationButton,
  settings,
}) => {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const t = useTranslations("mobileDrawer");
  const filteredMenuItems = menuItems.filter((item) => !item.hiddenOnMobile);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-0 z-50 flex h-full w-full transform flex-col bg-body/95 backdrop-blur transition-transform duration-300  ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 ">
          <div className="flex items-center">
            <div className="origin-left scale-[0.88]">
              <Logo />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings.theme_switcher ? (
              <ThemeSwitcher className="!h-14 !w-14 !text-2xl" />
            ) : null}

            <button
              type="button"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-border text-2xl transition hover:border-primary/40 hover:text-primary    "
              onClick={onClose}
              aria-label={t("closeNavigation")}
            >
              <LuX />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-12 pt-8">
          <div className="space-y-10">
            {settings.search ? (
              <section className="space-y-5 rounded-2xl border border-border/50 bg-white/95 p-6 shadow-md  ">
                <p className="text-base font-semibold uppercase tracking-[0.3em] text-primary/70 ">
                  {t("searchCatalog")}
                </p>
                <Suspense fallback={null}>
                  <SearchBar
                    placeholder={t("searchPlaceholder")}
                    inputId="mobile-drawer-search"
                    autoFocusOnMount={open}
                  />
                </Suspense>
              </section>
            ) : null}

            {settings.account ? (
              <MobileDrawerUserSection open={open} onClose={onClose} />
            ) : null}

            <nav className="space-y-4">
              {filteredMenuItems.map((item) => (
                <div key={item.name} className="space-y-4">
                  <Link
                    href={item.url || "#"}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 text-lg font-semibold text-text-dark shadow-sm transition hover:bg-primary/10 hover:text-primary    "
                  >
                    {getNavigationItemLabel(item, tCommon, tNav)}
                    <LuArrowRight className="text-base opacity-60" />
                  </Link>
                  {item.children?.length ? (
                    <ul className="ml-4 border-l border-border/40 pl-4 ">
                      {item.children.map((child) => (
                        <li key={child.url} className="py-2">
                          <Link
                            href={child.url}
                            onClick={onClose}
                            className="text-base text-text-light transition hover:text-primary  "
                          >
                            {getNavigationItemLabel(child, tCommon, tNav)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-border/60 px-6 py-6 ">
          {navigationButton?.enable ? (
            <Link
              href={navigationButton.link}
              onClick={onClose}
              className="btn btn-outline-primary py-3 text-base"
            >
              {navigationButton.label}
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
