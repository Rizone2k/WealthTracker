import React from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Manage your application preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-gray-500">
                  Switch between light and dark mode
                </p>
              </div>
              <Switch id="dark-mode" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size">Font Size</Label>
                <span className="text-sm text-gray-500">14px</span>
              </div>
              <Slider defaultValue={[14]} max={20} min={10} step={1} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency Display</CardTitle>
            <CardDescription>
              Configure how monetary values are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-decimals">Show Decimals</Label>
                <p className="text-sm text-gray-500">
                  Display decimal places in currency values
                </p>
              </div>
              <Switch id="show-decimals" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-currency-symbol">Show Currency Symbol</Label>
                <p className="text-sm text-gray-500">
                  Display currency symbol (₫) before values
                </p>
              </div>
              <Switch id="show-currency-symbol" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}