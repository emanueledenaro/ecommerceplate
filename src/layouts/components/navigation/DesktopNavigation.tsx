"use client";

import NavUser from "@/components/NavUser";
import SearchBar from "@/components/SearchBar";
import type config from "@/config/config.json";
import { getNavigationItemLabel } from "@/lib/i18n/navigationLabels";
import type { NavigationChildLink, NavigationLink } from "@/types/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import React, { Suspense } from "react";

import { isMenuItemActive } from "./utils";

interface NavigationButton {
  enable: boolean;
  label: string;
  link: string;
}

interface DesktopNavigationProps {
  menuItems: NavigationLink[];
  pathname: string;
  navigationButton: NavigationButton;
  settings: typeof config.settings;
  cartFallback: React.ReactNode;
  cartContent: React.ReactNode;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  menuItems,
  pathname,
  navigationButton,
  settings,
  cartFallback,
  cartContent,
}) => {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const [openItem, setOpenItem] = React.useState<string | null>(null);
  const enableDropdown = false; // toggle rapido per riabilitare il dropdown desktop

  const baseItemClasses =
    "rounded-full px-4 py-2 whitespace-nowrap transition hover:bg-primary/10 hover:text-primary  ";
  const activeItemClasses = "bg-primary/10 text-primary  ";
  const inactiveItemClasses = "text-text-dark ";

  const getItemClassName = (isActive: boolean, extraClassName = "") =>
    `${baseItemClasses} ${isActive ? activeItemClasses : inactiveItemClasses} ${extraClassName}`.trim();

  const handleCloseDropdown = React.useCallback(() => {
    setOpenItem(null);
  }, []);

  const renderMenuLink = (
    item: NavigationLink | NavigationChildLink,
    key?: string,
  ) => {
    const isActive = isMenuItemActive(item, pathname);

    return (
      <Link
        key={key ?? item.name}
        href={item.url || "#"}
        className={getItemClassName(isActive)}
      >
        {getNavigationItemLabel(item, tCommon, tNav)}
      </Link>
    );
  };

  const renderMenuWithChildren = (item: NavigationLink) => {
    const hasChildren = item.children && item.children.length > 0;

    if (!hasChildren || !enableDropdown) {
      if (hasChildren) {
        const firstChild = item.children?.[0];
        if (firstChild) {
          return renderMenuLink(firstChild, `${item.name}-${firstChild.name}`);
        }
      }

      return renderMenuLink(item);
    }

    const childActive = item.children?.some((child) =>
      isMenuItemActive(child, pathname),
    );
    const isActive = childActive || isMenuItemActive(item, pathname);
    const isOpen = openItem === item.name;

    return (
      <div
        key={item.name}
        className="group relative"
        onMouseEnter={() => setOpenItem(item.name)}
        onMouseLeave={handleCloseDropdown}
        onFocus={() => setOpenItem(item.name)}
        onBlur={(event) => {
          const relatedTarget = event.relatedTarget as Node | null;
          if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
            handleCloseDropdown();
          }
        }}
      >
        <button
          type="button"
          className={getItemClassName(
            Boolean(isActive),
            "flex items-center gap-1",
          )}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span>{getNavigationItemLabel(item, tCommon, tNav)}</span>
          <svg
            aria-hidden="true"
            focusable="false"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className={`absolute left-0 top-full z-20 mt-3 min-w-[200px] rounded-3xl bg-body p-3 shadow-lg/20 transition-all duration-150  ${
            isOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible translate-y-2 opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-1">
            {item.children?.map((child) => {
              const childIsActive = isMenuItemActive(child, pathname);

              return (
                <li key={child.name}>
                  <Link
                    href={child.url}
                    className={getItemClassName(
                      childIsActive,
                      "block rounded-2xl text-left text-sm font-medium",
                    )}
                  >
                    {getNavigationItemLabel(child, tCommon, tNav)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="hidden items-center justify-between gap-4 lg:flex">
      <nav className="flex items-center gap-1 text-sm font-semibold xl:gap-2">
        {menuItems.map((item) => {
          if (item.hasChildren) {
            return renderMenuWithChildren(item);
          }

          return renderMenuLink(item);
        })}
      </nav>

      <div className="flex items-center gap-3 xl:gap-4">
        {settings.search ? (
          <div className="hidden lg:block lg:w-64 xl:w-[420px]">
            <Suspense fallback={null}>
              <SearchBar inputId="header-search" />
            </Suspense>
          </div>
        ) : null}

        {navigationButton?.enable ? (
          <Link
            href={navigationButton.link}
            className="btn btn-outline-primary"
          >
            {navigationButton.label}
          </Link>
        ) : null}

        {settings.account ? <NavUser /> : null}

        <div className="flex items-center pb-[1.5px]">
          <Suspense fallback={cartFallback}>{cartContent}</Suspense>
        </div>
      </div>
    </div>
  );
};

export default DesktopNavigation;
