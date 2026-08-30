import { NavLink } from "react-router-dom";
import { Shield, Users, Package, ArrowRight } from "lucide-react";

const configCards = [
  {
    to: "/settings/roles",
    icon: Shield,
    label: "Roles",
    desc: "Crea y gestiona roles de acceso para los usuarios del sistema",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    to: "/settings/users",
    icon: Users,
    label: "Usuarios",
    desc: "Administra los usuarios y asigna sus roles y permisos",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    to: "/settings/modules",
    icon: Package,
    label: "Modulos",
    desc: "Configura los modulos del sidebar y asigna visibilidad por rol",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
];

function AdminDashboard() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Configuracion</h1>
      <p className="text-sm text-gray-500 mb-8">Gestiona roles, usuarios y modulos desde un solo lugar.</p>

      <div className="space-y-3">
        {configCards.map((card) => {
          const Icon = card.icon;
          return (
            <NavLink
              key={card.to}
              to={card.to}
              className={`flex items-center gap-4 bg-gray-950 border ${card.border} rounded-xl p-5 hover:bg-gray-900 transition-all no-underline group`}
            >
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors">{card.label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{card.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;
