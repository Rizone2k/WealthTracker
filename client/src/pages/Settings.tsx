import React from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
            <CardTitle>Currency Settings <b><u>{"(Coming Soon 💓)"}</u></b></CardTitle>
            <CardDescription>
              Configure how monetary values are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="VND">
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">Vietnamese Dong (₫)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Choose your preferred currency for displaying amounts</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Number Format</Label>
              <Select defaultValue="vi-VN">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi-VN">Vietnamese (1.234.567)</SelectItem>
                  <SelectItem value="en-US">US (1,234,567)</SelectItem>
                  <SelectItem value="de-DE">European (1.234.567,00)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Choose how numbers should be formatted</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}