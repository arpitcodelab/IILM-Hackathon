from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class MedicineProduct(Base):
    __tablename__ = "medicine_products"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String(255), nullable=False, index=True)
    generic_name = Column(String(500), nullable=False, index=True)
    manufacturer_name = Column(String(255), nullable=True, index=True)
    dosage_form = Column(String(100), nullable=False, index=True)  # Tablet, Capsule, Syrup, Injection, Cream, etc.
    administration_route = Column(String(100), nullable=False, default="Oral", index=True)  # Oral, Topical, IV, etc.
    release_type = Column(String(100), nullable=False, default="immediate-release", index=True)  # immediate-release, modified-release, sustained-release, extended-release
    pack_size = Column(Float, nullable=False, default=10.0)  # Quantity in pack (e.g. 10 tablets, 100 ml)
    pack_unit = Column(String(50), nullable=False, default="tablets")  # tablets, capsules, ml, etc.
    prescription_status = Column(String(100), nullable=False, default="Schedule H")  # Schedule H, Schedule H1, OTC, etc.
    is_jan_aushadhi = Column(Boolean, default=False, index=True)
    pmbi_code = Column(String(50), nullable=True, index=True)
    therapeutic_group = Column(String(255), nullable=True, index=True)
    source_id = Column(Integer, ForeignKey("data_sources.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    source = relationship("DataSource", back_populates="medicines")
    ingredients = relationship("ProductIngredient", back_populates="product", cascade="all, delete-orphan", order_by="ProductIngredient.id")
    prices = relationship("MedicinePrice", back_populates="product", cascade="all, delete-orphan", order_by="desc(MedicinePrice.verified_at)")

    @property
    def latest_verified_price(self):
        for p in self.prices:
            if p.verification_status == "verified":
                return p
        return None

    def __repr__(self):
        return f"<MedicineProduct {self.brand_name} ({self.generic_name})>"
