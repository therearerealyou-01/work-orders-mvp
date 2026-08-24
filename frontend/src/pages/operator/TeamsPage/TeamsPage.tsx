import { useEffect, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import { fetchTeams } from "../../../api/teams";
import type { PublicTeam } from "../../../types";
import { PageHeader, Table, toast, type Column } from "../../../ui";

export function OperatorTeamsPage() {
  const [teams, setTeams] = useState<PublicTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams()
      .then(setTeams)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<PublicTeam>[] = [
    { key: "teamName", title: "Бригада", render: (row) => row.teamName },
    { key: "fullName", title: "ФИО", render: (row) => row.fullName },
    { key: "phone", title: "Телефон", render: (row) => row.phone },
    { key: "email", title: "Email", render: (row) => row.email },
  ];

  return (
    <div>
      <PageHeader title="Бригады" />

      <Table
        rowKey={(row) => row.uuid}
        loading={loading}
        columns={columns}
        rows={teams}
      />
    </div>
  );
}
