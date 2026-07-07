import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_URL;
const EventDetailsItems = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

async function EventDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await fetch(`${API_URL}/api/events/${slug}`);
  const {
    event: {
      title,
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      audience,
      tags,
    },
  } = await response.json();

  if (!title) return notFound();

  return (
    <section id="event">
      <div className="header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="details">
        {/* Left side - Event content */}
        <div className="content">
          <Image
            src={image}
            alt="Event banner"
            width={800}
            height={800}
            className="banner"
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailsItems
              icon={"/icons/calendar.svg"}
              alt={"Date"}
              label={date}
            />
            <EventDetailsItems
              icon={"/icons/clock.svg"}
              alt={"Time"}
              label={time}
            />
            <EventDetailsItems
              icon={"/icons/pin.svg"}
              alt={"Location"}
              label={location}
            />
            <EventDetailsItems
              icon={"/icons/audience.svg"}
              alt={"Audience"}
              label={audience}
            />
            <EventDetailsItems
              icon={"/icons/mode.svg"}
              alt={"Mode"}
              label={mode}
            />
          </section>

          <EventAgenda agendaItems={agenda || []} />
        </div>

        {/* Right side - Booking form */}
        <aside className="booking">
          <p className="text-lg font-semibold">Book Event</p>
        </aside>
      </div>
    </section>
  );
}

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return (
    <section id="event">
      <Suspense fallback={<div>Loading event details...</div>}>
        <EventDetails params={params} />
      </Suspense>
    </section>
  );
};
export default EventDetailsPage;
