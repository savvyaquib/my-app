import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BookEvent } from "@/components/BookEvent";
import { IEvent } from "@/database";
import {
  getSimilarEventsBySlug,
  getEventBySlug,
} from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";

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

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

async function EventDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, similarEvents] = await Promise.all([
    getEventBySlug(slug),
    getSimilarEventsBySlug(slug),
  ]);

  if (!event || !event.title) return notFound();

  const {
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
    organizer,
  } = event;

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
            alt={`${title} banner`}
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
              icon="/icons/calendar.svg"
              alt="Date"
              label={date}
            />
            <EventDetailsItems
              icon="/icons/clock.svg"
              alt="Time"
              label={time}
            />
            <EventDetailsItems
              icon="/icons/pin.svg"
              alt="Location"
              label={location}
            />
            <EventDetailsItems
              icon="/icons/audience.svg"
              alt="Audience"
              label={audience}
            />
            <EventDetailsItems
              icon="/icons/mode.svg"
              alt="Mode"
              label={mode}
            />
          </section>

          <EventAgenda agendaItems={agenda || []} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags || []} />
        </div>

        {/* Right side - Booking form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            <BookEvent eventId={event._id} slug={event.slug} />
          </div>
        </aside>
      </div>
      {similarEvents.length > 0 && (
        <div className="flex w-full flex-col gap-4 pt-20">
          <h2>Similar Events</h2>
          <div className="events">
            {similarEvents.map((similarEvent: IEvent) => (
              <EventCard key={similarEvent.slug} {...similarEvent} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return (
    <Suspense fallback={<div>Loading event details...</div>}>
      <EventDetails params={params} />
    </Suspense>
  );
};
export default EventDetailsPage;
