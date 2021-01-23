module Types
  class ChipPoolType < Types::BaseObject
    field(:chip_count, [Types::ChipCountType], null: true)
  end
end
