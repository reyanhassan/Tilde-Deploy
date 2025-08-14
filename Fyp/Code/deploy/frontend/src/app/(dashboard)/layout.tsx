"use client";
import * as React from "react";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Stack, IconButton, TextField, Tooltip, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ThemeSwitcher } from "@toolpad/core/DashboardLayout";

function ToolbarActionsSearch() {
  return (
    <Stack direction="row">
      <Tooltip title="Search" enterDelay={1000}>
        <div>
          <IconButton
            type="button"
            aria-label="search"
            sx={{ display: { xs: "inline", md: "none" } }}
          >
            <SearchIcon />
          </IconButton>
        </div>
      </Tooltip>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: (
            <IconButton type="button" aria-label="search" size="small">
              <SearchIcon />
            </IconButton>
          ),
          sx: { pr: 0.5 },
        }}
        sx={{ display: { xs: "none", md: "inline-block" }, mr: 1 }}
      />
      <ThemeSwitcher />
    </Stack>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      slots={{
        toolbarActions: ToolbarActionsSearch,
      }}
    >
      <PageContainer>{children}</PageContainer>
    </DashboardLayout>
  );
}
