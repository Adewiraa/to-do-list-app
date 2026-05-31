import type { Meta, StoryObj } from "@storybook/react";
import IconRenderer from "./IconRenderer";

const meta = {
  title: "Components/IconRenderer",
  component: IconRenderer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "select",
      options: ["Folder", "Briefcase", "GraduationCap", "BookOpen", "Home", "Heart", "ShoppingBag", "Coffee", "Code", "Gamepad2", "Plane"],
      description: "Name of the Lucide icon to render",
    },
    size: {
      control: { type: "number", min: 10, max: 100, step: 2 },
      description: "Size of the icon in pixels",
    },
    className: {
      control: "text",
      description: "Custom Tailwind CSS classes to apply",
    },
  },
} satisfies Meta<typeof IconRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Folder",
    size: 24,
    className: "text-purple-500",
  },
};

export const GraduationCapIcon: Story = {
  args: {
    name: "GraduationCap",
    size: 32,
    className: "text-pink-500 animate-pulse",
  },
};

export const WorkIcon: Story = {
  args: {
    name: "Briefcase",
    size: 40,
    className: "text-blue-500 hover:scale-110 transition-transform duration-200",
  },
};

export const DevelopmentIcon: Story = {
  args: {
    name: "Code",
    size: 48,
    className: "text-emerald-500",
  },
};
