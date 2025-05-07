interface KPIStatProps {
  label: string;
  value: string | number;
}

export const KPIStat: React.FC<KPIStatProps> = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);
