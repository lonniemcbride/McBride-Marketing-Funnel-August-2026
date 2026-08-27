import { SupplementForm } from "@/components/supplement/supplement-form";

export default async function NatoSupplementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <SupplementForm id={id} />
    </div>
  );
}
