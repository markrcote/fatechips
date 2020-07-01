module Types
  class ChipCountType < Types::BaseObject
    description("A number of chips of the same type")
    field(:id, ID, null: false)
    field(:chip_type, String, null: false)
    field(:count, Integer, null: false)
  end
end
