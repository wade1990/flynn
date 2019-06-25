package protobuf

func MatchLabelFilters(labels map[string]string, labelFilters []*LabelFilter) bool {
	if len(labelFilters) == 0 {
		return true
	}
	for _, f := range labelFilters {
		if f.Match(labels) {
			return true
		}
	}
	return false
}

func (f *LabelFilter) Match(labels map[string]string) bool {
	for _, e := range f.Expressions {
		if !e.Match(labels) {
			return false
		}
	}
	return true
}

func (e *LabelFilter_Expression) Match(labels map[string]string) bool {
	switch e.Op {
	case LabelFilter_Expression_OP_IN:
		if v, ok := labels[e.Key]; ok {
			for _, ev := range e.Values {
				if v == ev {
					return true
				}
			}
		}
		return false
	case LabelFilter_Expression_OP_NOT_IN:
		if v, ok := labels[e.Key]; ok {
			for _, ev := range e.Values {
				if v == ev {
					return false
				}
			}
		}
	case LabelFilter_Expression_OP_EXISTS:
		if _, ok := labels[e.Key]; !ok {
			return false
		}
	case LabelFilter_Expression_OP_NOT_EXISTS:
		if _, ok := labels[e.Key]; ok {
			return false
		}
	}
	return true
}
