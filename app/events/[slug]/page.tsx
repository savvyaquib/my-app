import { Suspense } from "react";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_URL;

async function EventDetails({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const response = await fetch(`${API_URL}/api/events/${slug}`);
    const { event } = await response.json();

    if (!event) return notFound();

    return (
        <h1>Event details: <br /> {slug} </h1>
    );
}

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    return (
        <section id="event">
            <Suspense fallback={<div>Loading event details...</div>}>
                <EventDetails params={params} />
            </Suspense>
        </section>
    );
}
export default EventDetailsPage;