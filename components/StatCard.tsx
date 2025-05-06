interface StatCardProps {
  title: string;
  value: string | number;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex flex-col justify-between">
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800 mt-2">{value}</h2>
    </div>
  );
}
