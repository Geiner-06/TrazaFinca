import { FEED_PURPOSES } from '../data/feedConstants.js';

export default function FeedPlanCard({ plan, assignedCount = 0, onEdit }) {
    const purposeClass = `feed-purpose-${plan.proposito}`;

    return (
        <div className="feed-plan-card">
            <div className="feed-plan-header">
                <span className={`feed-purpose-badge ${purposeClass}`}>
                    {FEED_PURPOSES[plan.proposito] || plan.proposito}
                </span>
                {plan.esBase ? (
                    <span className="feed-base-tag">Plan base</span>
                ) : (
                    <span className="feed-custom-tag">Personalizado</span>
                )}
            </div>

            <h4 className="feed-plan-name">{plan.nombre}</h4>

            {/* Parámetros nutricionales */}
            <div className="feed-nutrition-grid">
                <div className="feed-nutrition-item">
                    <span className="nutrition-value">{plan.proteina}%</span>
                    <span className="nutrition-label">Proteína</span>
                </div>
                <div className="feed-nutrition-item">
                    <span className="nutrition-value">{plan.energia}</span>
                    <span className="nutrition-label">Energía (Mcal/kg)</span>
                </div>
                <div className="feed-nutrition-item">
                    <span className="nutrition-value">{plan.fibra}%</span>
                    <span className="nutrition-label">Fibra</span>
                </div>
            </div>

            <div className="feed-plan-details">
                <p><strong>Insumos:</strong> {plan.ingredientes}</p>
                <p>
                    <strong>Ración diaria:</strong> {plan.cantidadDiaria} {plan.unidad} por animal
                    {' · '}<strong>Frecuencia:</strong> {plan.frecuencia}
                </p>
            </div>

            <div className="feed-plan-footer">
                <span className="feed-assigned-count">
                    {assignedCount} {assignedCount === 1 ? 'animal asignado' : 'animales asignados'}
                </span>
                {plan.esBase ? (
                    <button className="btn btn-outline btn-sm" onClick={() => onEdit(plan, true)}>
                        Duplicar y editar
                    </button>
                ) : (
                    <button className="btn btn-outline btn-sm" onClick={() => onEdit(plan, false)}>
                        Editar
                    </button>
                )}
            </div>
        </div>
    );
}
