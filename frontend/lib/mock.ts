export const mockProperties = [
  {
    id: "p1",
    title: "2BR loft, Yaba",
    location: "Lagos, Nigeria",
    rentPerMonth: 320,
    deposit: 640,
    leaseMonths: 12,
  },
  {
    id: "p2",
    title: "Studio, Westlands",
    location: "Nairobi, Kenya",
    rentPerMonth: 180,
    deposit: 360,
    leaseMonths: 6,
  },
  {
    id: "p3",
    title: "3BR house, Sandton",
    location: "Johannesburg, South Africa",
    rentPerMonth: 540,
    deposit: 1080,
    leaseMonths: 12,
  },
];

export const mockDashboard = {
  activeLeases: 2,
  dueThisMonth: 500,
  escrowed: 1000,
  recent: [
    {
      id: "r1",
      property: "2BR loft, Yaba",
      date: "2026-05-01",
      amount: 320,
      txHash: "abcd1234abcd1234abcd1234abcd1234",
    },
    {
      id: "r2",
      property: "Studio, Westlands",
      date: "2026-05-01",
      amount: 180,
      txHash: "efgh5678efgh5678efgh5678efgh5678",
    },
    {
      id: "r3",
      property: "2BR loft, Yaba",
      date: "2026-04-01",
      amount: 320,
      txHash: "ijkl9012ijkl9012ijkl9012ijkl9012",
    },
  ],
};
