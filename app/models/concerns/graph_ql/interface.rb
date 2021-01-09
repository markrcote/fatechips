require "active_support/concern"

module GraphQL
  module Interface
    extend ActiveSupport::Concern
    
    def gql_id
      GraphQL::Schema::UniqueWithinType.encode(self.class.name, id)
    end
        
    class_methods do
      def find_by_gql_id(gql_id)
        _type_name, object_id = GraphQL::Schema::UniqueWithinType.decode(gql_id)
        
        find(object_id)
      end
        
      def find_by_gql_ids(gql_ids)
        ids = gql_ids.map do |gql_id|
          GraphQL::Schema::UniqueWithinType.decode(gql_id).last
        end
        
        where(id: ids)
      end
    end
  end
end
