"use client";

import { useRouter } from "next/navigation";
import { FiEdit } from "react-icons/fi";
import { CiViewList } from "react-icons/ci";

interface ScheduledTourActionsProps {
  externalId: number;
}

export default function ScheduledTourActions({
  externalId,
}: ScheduledTourActionsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <CiViewList
        type="button"
        onClick={() => router.push(`/admin/scheduled-tours/${externalId}`)}
        className="text-blue text-2xl"
      >
        View
      </CiViewList>

      <FiEdit
        onClick={() => router.push(`/admin/scheduled-tours/${externalId}/edit`)}
        className="text-blue text-lg"
      >
        Edit
      </FiEdit>
    </div>
  );
}
