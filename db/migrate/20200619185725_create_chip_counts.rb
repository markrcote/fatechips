class CreateChipCounts < ActiveRecord::Migration[6.0]
  def change
    create_table :chip_counts do |t|
      t.integer :chip_type
      t.integer :count
      t.references :chip_pool, null: false, foreign_key: true

      t.timestamps
    end
  end
end
