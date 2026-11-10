"use client";

import React from "react";
import { ThemeProvider, useAdminTheme, useTheme, Theme } from "@/components/theme/ThemeProvider";

export type AdminTheme = Theme;
export { ThemeProvider as AdminThemeProvider, useAdminTheme, useTheme };
