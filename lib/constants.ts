export interface Event {
  title: string;
  slug: string;
  image: string;
  location: string;
  date: string; // ISO-ish YYYY-MM-DD for easy parsing
  time: string; // human-readable time range
  description?: string;
}

export const events: Event[] = [
  {
    title: "React Summit 2026",
    slug: "react-summit-2026",
    image: "/images/event-full.png",
    location: "Amsterdam, Netherlands",
    date: "2026-10-15",
    time: "09:00 AM - 06:00 PM",
    description:
      "Two days of talks, workshops and hands-on sessions covering React, state management, performance and tooling."
  },
  {
    title: "JSConf EU 2026",
    slug: "jsconf-eu-2026",
    image: "/images/event1.png",
    location: "Berlin, Germany",
    date: "2026-09-20",
    time: "09:30 AM - 05:30 PM",
    description: "Community-driven JavaScript conference with talks from core contributors and platform teams."
  },
  {
    title: "Next.js Conf 2026",
    slug: "nextjs-conf-2026",
    image: "/images/event2.png",
    location: "San Francisco, CA, USA",
    date: "2026-11-03",
    time: "10:00 AM - 04:00 PM",
    description: "Official Next.js conference: feature announcements, case studies, and breakout workshops."
  },
  {
    title: "Hacktober Online Hackathon 2026",
    slug: "hacktober-hackathon-2026",
    image: "/images/event3.png",
    location: "Online",
    date: "2026-10-21",
    time: "All-day",
    description: "Open participation hackathon encouraging contributors to open-source projects and ship small features."
  },
  {
    title: "KubeCon + CloudNativeCon 2026",
    slug: "kubecon-2026",
    image: "/images/event4.png",
    location: "Paris, France",
    date: "2026-11-09",
    time: "08:30 AM - 05:30 PM",
    description: "The biggest gathering for cloud native and Kubernetes users, maintainers and vendors."
  },
  {
    title: "HackMIT 2026",
    slug: "hackmit-2026",
    image: "/images/event5.png",
    location: "Cambridge, MA, USA",
    date: "2026-11-14",
    time: "07:00 PM - 11:59 PM",
    description: "Student-run 24-hour hackathon welcoming developers, designers, and entrepreneurs."
  },
  {
    title: "Global AI & Developer Summit 2026",
    slug: "ai-dev-summit-2026",
    image: "/images/event6.png",
    location: "London, UK",
    date: "2026-12-02",
    time: "09:00 AM - 06:00 PM",
    description: "A focused summit on applying AI in developer tooling, workflows, and production systems."
  }
];

export default events;
