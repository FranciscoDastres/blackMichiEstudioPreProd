// StatCard.jsx
const StatCard = ({ title, value, icon: Icon }) => {
    return (
        <div className="bg-background rounded-lg shadow p-6 flex items-center justify-between border border-border">
            <div>
                <p className="text-sm text-muted">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>

            {Icon && (
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Icon size={24} />
                </div>
            )}
        </div>
    );
};

export default StatCard;