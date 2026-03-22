import RoomView from "@/views/RoomView";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoomView profileId={id} />;
}
