class CreateChipPools < ActiveRecord::Migration[6.0]
  def change
    create_table :chip_pools do |t|

      t.timestamps
    end
  end
end
